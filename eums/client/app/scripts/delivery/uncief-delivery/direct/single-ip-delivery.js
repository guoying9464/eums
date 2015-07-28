angular.module('SingleIpDirectDelivery', ['ngToast', 'DistributionPlanNode'])
    .controller('SingleIpDirectDeliveryController', function ($scope, PurchaseOrderService, $routeParams, IPService,
                                                              ngToast, DistributionPlanService, DeliveryNode, $q,
                                                              DistributionPlanNodeService) {
        $scope.consignee = {};
        $scope.contact = {};
        $scope.district = {};

        loadOrderData();

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
            $scope.districtsLoaded = true;
        });

        $scope.save = function (tracked) {
            $scope.tracked = tracked || false;
            var someInputsAreEmpty = !(
                $scope.delivery.contact_person_id
                && $scope.delivery.consignee
                && $scope.delivery.delivery_date
                && $scope.delivery.location
            );
            var someItemsAreInvalid = $scope.purchaseOrderItems.any(function (item) {
                return item.isInvalid(item.quantityShipped);
            });

            if (someInputsAreEmpty || someItemsAreInvalid) {
                $scope.errors = true;
                createToast('Cannot save. Please fill out or fix values for all fields marked in red', 'danger')
            }
            else {
                $scope.purchaseOrder.isSingleIp ? saveDelivery() : angular.element('#confirmation-modal').modal();
            }
        };

        $scope.warningAccepted = function () {
            angular.element('#confirmation-modal').modal('hide');
            saveDelivery();
        };

        var saveDelivery = function () {
            var totalQuantityShipped = $scope.purchaseOrderItems.sum(function (item) {
                return item.quantityShipped || 0;
            });
            if (!$scope.delivery.id && totalQuantityShipped) {
                showLoader();
                createDelivery()
                    .then(createDeliveryNodes)
                    .then(updatePurchaseOrderDeliveryMode)
                    .then(loadOrderData)
                    .then(notifyOnSuccess)
                    .catch(alertOnSaveFailure)
                    .finally(hideLoader)
            }
            else if ($scope.delivery.id && totalQuantityShipped) {
                showLoader();
                updateDelivery()
                    .then(updateOrCreateDeliveryNodes)
                    .then(loadOrderData)
                    .then(function () {
                        notifyOnSuccess('Delivery updated');
                    })
                    .catch(alertOnSaveFailure)
                    .finally(hideLoader);
            }
            else if (!totalQuantityShipped) {
                createToast('Cannot save delivery with zero quantity shipped', 'danger');
            }
        };

        function showLoader() {
            angular.element('#loading').modal();
        }

        function hideLoader() {
            angular.element('#loading').modal('hide');
        }

        function alertOnSaveFailure() {
            createToast('Save failed', 'danger');
        }

        function updatePurchaseOrderDeliveryMode() {
            return PurchaseOrderService.update({id: $scope.purchaseOrder.id, isSingleIp: true}, 'PATCH');
        }

        function notifyOnSuccess(message) {
            message = message || 'Delivery created';
            createToast(message, 'success');
        }

        function getDeliveryFields() {
            return {
                programme: $scope.purchaseOrder.programme,
                consignee: $scope.delivery.consignee,
                location: $scope.delivery.location,
                delivery_date: moment(new Date($scope.delivery.delivery_date)).format('YYYY-MM-DD'),
                contact_person_id: $scope.delivery.contact_person_id,
                remark: $scope.delivery.remark,
                track: $scope.tracked
            };
        }

        function createDelivery() {
            var deliveryFields = getDeliveryFields();
            return DistributionPlanService.createPlan(deliveryFields);
        }

        function updateDelivery() {
            var deliveryFields = getDeliveryFields();
            deliveryFields.id = $scope.delivery.id;
            return DistributionPlanService.update(deliveryFields);
        }

        function loadPurchaseOrderValue(purchaseOrder) {
            PurchaseOrderService.getDetail(purchaseOrder, 'total_value').then(function (totalValue) {
                purchaseOrder.totalValue = totalValue;
                hideLoader();
            });
        }

        function loadOrderData() {
            showLoader();
            PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item'])
                .then(function (purchaseOrder) {
                    loadPurchaseOrderValue(purchaseOrder);
                    loadPurchaseOrderDeliveries(purchaseOrder).then(function () {
                        $scope.contentLoaded = true;
                    });
                    $scope.purchaseOrder = purchaseOrder;
                    $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
                });
        }

        function loadPurchaseOrderDeliveries(purchaseOrder) {
            return PurchaseOrderService.getDetail(purchaseOrder, 'deliveries').then(function (deliveries) {
                $scope.trackedDeliveries = deliveries.filter(function (delivery) {
                    return delivery.track;
                });
                $scope.delivery = deliveries.filter(function (delivery) {
                        return !delivery.track;
                    }).first() || {};
            })
        }

        function createDeliveryNodes(createdDelivery) {
            function createNodeFrom(purchaseOrderItem) {
                return DistributionPlanNodeService.create(new DeliveryNode({
                    item: purchaseOrderItem,
                    targetedQuantity: purchaseOrderItem.quantityShipped,
                    distributionPlan: createdDelivery,
                    consignee: $scope.delivery.consignee,
                    location: $scope.delivery.location,
                    deliveryDate: moment(new Date($scope.delivery.delivery_date)).format('YYYY-MM-DD'),
                    contactPerson: $scope.delivery.contact_person_id,
                    remark: $scope.delivery.remark,
                    track: createdDelivery.track,
                    isEndUser: false,
                    treePosition: 'IMPLEMENTING_PARTNER'
                }));
            }

            var createNodePromises = [];
            $scope.purchaseOrderItems.forEach(function (purchaseOrderItem) {
                purchaseOrderItem.quantityShipped && createNodePromises.push(createNodeFrom(purchaseOrderItem));
            });
            return $q.all(createNodePromises);
        }

        function updateOrCreateDeliveryNodes() {
            //DistributionPlanNodeService.filter({distribution_plan: $scope.delivery.id}).then(function (nodes) {
            //
            //});
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }
    });
