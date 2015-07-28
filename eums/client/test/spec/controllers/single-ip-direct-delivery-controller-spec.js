describe('Single IP Direct Delivery Controller', function () {
    var mockPurchaseOrderService, scope, location, mockIpService,
        toast, mockDeliveryService, DeliveryNodeModel, mockDeliveryNodeService, q;
    var nodeOne, nodeTwo, itemOne, itemTwo, consignee, district, deliveryDate, formattedDeliveryDate, contact, remark;
    var purchaseOrderValue = 1300.5;
    var trackedDelivery = {
        id: 1,
        location: 'Kampala',
        consignee: {id: 10},
        track: true,
        delivery_date: '2015-01-02',
        remark: 'some remarks'
    };
    var untrackedDelivery = {
        id: 2,
        location: 'Khartoum',
        consignee: {id: 2},
        track: false,
        delivery_date: '2015-03-15',
        remark: 'no remarks'
    };
    var deliveries = [trackedDelivery, untrackedDelivery];
    var valid = function () {
        return false
    };
    var purchaseOrderItems = [
        {quantityShipped: 10, id: 1, isInvalid: valid},
        {quantityShipped: 11, id: 2, isInvalid: valid}
    ];
    var programmeId = 1;
    var createdTrackedDelivery = {
        id: 10,
        programme: programmeId,
        contact_person_id: 1,
        consignee: 1,
        location: 'Kampala',
        delivery_date: '2015-01-03',
        track: true,
        remark: 'some remark'
    };
    var purchaseOrder = {id: 1, purchaseorderitemSet: purchaseOrderItems, programme: programmeId};
    var routeParams = {purchaseOrderId: purchaseOrder.id};
    var districts = [{name: 'Kampala', id: 'Kampala'}, {name: 'Jinja', id: 'Jinja'}];
    var districtsResponse = {data: ['Kampala', 'Jinja']};
    var emptyFunction = function () {
    };
    var mockModal = {modal: emptyFunction};
    var mockLoader = {modal: emptyFunction};
    var jqueryFake = function (selector) {
        return selector === '#confirmation-modal' ? mockModal : mockLoader;
    };

    beforeEach(function () {
        module('SingleIpDirectDelivery');

        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['get', 'getDetail', 'update']);
        mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);
        mockDeliveryService = jasmine.createSpyObj('mockDeliveryService', ['createPlan', 'update']);
        mockDeliveryNodeService = jasmine.createSpyObj('mockDeliveryNodeService', ['create', 'update']);

        inject(function ($controller, $rootScope, $location, $q, ngToast, DeliveryNode) {
            DeliveryNodeModel = DeliveryNode;
            scope = $rootScope.$new();
            location = $location;
            toast = ngToast;
            q = $q;

            mockPurchaseOrderService.getDetail.and.callFake(fakeGetDetail);
            mockPurchaseOrderService.get.and.returnValue($q.when(purchaseOrder));
            mockPurchaseOrderService.update.and.returnValue($q.when({}));
            mockDeliveryNodeService.create.and.returnValue($q.when(new DeliveryNodeModel({id: 1})));
            mockDeliveryNodeService.update.and.returnValue($q.when(new DeliveryNodeModel({id: 1})));
            mockDeliveryService.createPlan.and.returnValue($q.when(createdTrackedDelivery));
            mockDeliveryService.update.and.returnValue($q.when(createdTrackedDelivery));
            mockIpService.loadAllDistricts.and.returnValue($q.when(districtsResponse));

            spyOn(angular, 'element').and.callFake(jqueryFake);
            spyOn(mockModal, 'modal');
            spyOn(mockLoader, 'modal');
            spyOn(toast, 'create');

            $controller('SingleIpDirectDeliveryController', {
                $scope: scope,
                $location: location,
                $routeParams: routeParams,
                PurchaseOrderService: mockPurchaseOrderService,
                IPService: mockIpService,
                DistributionPlanService: mockDeliveryService,
                DistributionPlanNodeService: mockDeliveryNodeService,
                DeliveryNode: DeliveryNodeModel,
                ngToast: toast
            });

            function fakeGetDetail(_, detail_route) {
                return detail_route === 'total_value' ? $q.when(0) : $q.when(deliveries)
            }
        });
    });

    describe('on load', function () {
        var totalValuePromise, deliveriesPromise;
        beforeEach(function () {
            totalValuePromise = q.defer();
            deliveriesPromise = q.defer();
        });

        it('should show loader while loading and hide it after', function () {
            var getPurchaseOrder = q.defer();
            mockPurchaseOrderService.get.and.returnValue(getPurchaseOrder.promise);
            mockPurchaseOrderService.getDetail.and.callFake(fakeGetDetail);

            scope.$apply();

            expect(mockLoader.modal).toHaveBeenCalled();
            expect(mockLoader.modal.calls.count()).toBe(1);

            getPurchaseOrder.resolve({});
            totalValuePromise.resolve(0);
            deliveriesPromise.resolve(deliveries);
            scope.$apply();
            expect(mockLoader.modal).toHaveBeenCalledWith('hide');
        });

        it('should put empty objects on on scope', function () {
            scope.$apply();
            expect(scope.consignee).toEqual({});
            expect(scope.contact).toEqual({});
            expect(scope.district).toEqual({});
        });

        it('should default scope delivery to empty object if there is no untracked delivery for purchase order', function () {
            mockPurchaseOrderService.getDetail.and.returnValue(q.when([]));
            scope.$apply();
            expect(scope.delivery).toEqual({});
        });

        it('should load all districts and put them on scope and notify directive', function () {
            expect(scope.districtsLoaded).toBeFalsy();
            scope.$apply();
            expect(mockIpService.loadAllDistricts).toHaveBeenCalled();
            expect(scope.districts).toEqual(districts);
            expect(scope.districtsLoaded).toBe(true);
        });

        it('should fetch purchase order with id specified in route and put it on scope', function () {
            scope.$apply();
            expect(mockPurchaseOrderService.get).toHaveBeenCalledWith(purchaseOrder.id, jasmine.any(Array));
            expect(scope.purchaseOrder).toEqual(purchaseOrder);
        });

        it('should put purchase order value on scope purchase order', function () {
            totalValuePromise.resolve(purchaseOrderValue);
            mockPurchaseOrderService.getDetail.and.callFake(fakeGetDetail);
            scope.$apply();
            expect(mockPurchaseOrderService.getDetail).toHaveBeenCalledWith(jasmine.any(Object), 'total_value');
            expect(mockPurchaseOrderService.getDetail.calls.mostRecent().args.first().id).toBe(purchaseOrder.id);
            expect(scope.purchaseOrder.totalValue).toEqual(purchaseOrderValue);
        });

        it('should put purchase order items on the scope', function () {
            scope.$apply();
            expect(mockPurchaseOrderService.get).toHaveBeenCalledWith(purchaseOrder.id, ['purchaseorderitem_set.item']);
            expect(scope.purchaseOrderItems).toEqual(purchaseOrderItems);
        });

        it('should load purchase order deliveries and put untracked one on the scope', function () {
            mockPurchaseOrderService.getDetail.and.returnValue(q.when(deliveries));
            scope.$apply();
            expect(mockPurchaseOrderService.getDetail).toHaveBeenCalledWith(jasmine.any(Object), 'deliveries');
            expect(mockPurchaseOrderService.getDetail.calls.mostRecent().args.first().id).toBe(purchaseOrder.id);
            expect(scope.delivery).toEqual(untrackedDelivery);
        });

        it('should load purchase order deliveries and put tracked ones on the scope', function () {
            mockPurchaseOrderService.getDetail.and.returnValue(q.when(deliveries));
            scope.$apply();
            expect(mockPurchaseOrderService.getDetail).toHaveBeenCalledWith(jasmine.any(Object), 'deliveries');
            expect(mockPurchaseOrderService.getDetail.calls.mostRecent().args.first().id).toBe(purchaseOrder.id);
            expect(scope.trackedDeliveries).toEqual([trackedDelivery]);
        });

        function fakeGetDetail(_, detail_route) {
            return detail_route === 'total_value' ? totalValuePromise.promise : deliveriesPromise.promise;
        }
    });

    describe('when save is called', function () {
        beforeEach(function () {
            scope.purchaseOrderItems = []
        });

        it('should throw and error when required fields are not filled out', function () {
            testErrorIsOnScope('consignee', {});
            testErrorIsOnScope('deliveryDate');
            testErrorIsOnScope('contact', {});
            testErrorIsOnScope('district', {});
        });

        it('should throw error if any of the purchase order items are invalid', function () {
            makeScopeFixture();
            setScopeData();
            var invalidItemOne = Object.clone(itemOne);
            invalidItemOne.isInvalid = function () {
                return true;
            };
            scope.purchaseOrderItems = [invalidItemOne, itemTwo];
            scope.save(true);
            scope.$apply();

            expect(scope.errors).toBeTruthy();
        });

        it('should show warning modal if purchase order is not already in single IP mode', function () {
            makeScopeFixture();
            setScopeData();
            scope.purchaseOrder = {};
            scope.save(true);
            scope.$apply();
            expect(mockModal.modal).toHaveBeenCalled();
        });

        it('should NOT show warning modal if purchase order is already in single IP mode', function () {
            makeScopeFixture();
            setScopeData();
            scope.purchaseOrder = {isSingleIp: true};
            scope.save(true);
            scope.$apply();
            expect(mockModal.modal).not.toHaveBeenCalled();
        });

        it('should NOT show warning modal if some data on scope is blank', function () {
            makeScopeFixture();
            setScopeData();
            scope.delivery.delivery_date = undefined;
            scope.purchaseOrder = {isSingleIp: false};
            scope.save(true);
            scope.$apply();
            expect(mockModal.modal).not.toHaveBeenCalled();
        });

        function testErrorIsOnScope(scopeField, nullState) {
            var fields = ['contact', 'consignee', 'deliveryDate', 'district'];
            fields.forEach(function (field) {
                if (field !== scopeField) {
                    scope[field] = {id: 1};
                }
            });
            scope[scopeField] = nullState;

            scope.$apply();
            scope.save(true);
            expect(scope.errors).toBeTruthy();
            expect(toast.create).toHaveBeenCalledWith({
                content: 'Cannot save. Please fill out or fix values for all fields marked in red',
                class: 'danger'
            });
        }
    });

    describe('when save is confirmed', function () {
        beforeEach(function () {
            makeScopeFixture();
            var deliveryCommonFields = {
                distributionPlan: createdTrackedDelivery,
                consignee: consignee.id,
                location: district.id,
                deliveryDate: formattedDeliveryDate,
                contactPerson: contact.id,
                remark: remark,
                track: true,
                isEndUser: false,
                treePosition: 'IMPLEMENTING_PARTNER'
            };

            scope.purchaseOrder = {isSingleIp: true, programme: programmeId};
            scope.purchaseOrderItems = purchaseOrderItems;
            nodeOne = new DeliveryNodeModel(Object.merge({
                item: itemOne,
                targetedQuantity: itemOne.quantityShipped
            }, deliveryCommonFields));
            nodeTwo = new DeliveryNodeModel(Object.merge({
                item: itemTwo,
                targetedQuantity: itemTwo.quantityShipped
            }, deliveryCommonFields));
            setScopeData();
        });

        it('should create a new delivery when there is no current delivery on scope', function () {
            scope.save(true);
            scope.$apply();
            expect(mockDeliveryService.createPlan).toHaveBeenCalledWith({
                programme: programmeId,
                consignee: consignee.id,
                location: district.id,
                delivery_date: formattedDeliveryDate,
                contact_person_id: contact.id,
                remark: remark,
                track: true
            });
        });

        it('should create a new untracked delivery when there is no current delivery on scope', function () {
            scope.save();
            scope.$apply();
            expect(mockDeliveryService.createPlan).toHaveBeenCalledWith({
                programme: programmeId,
                consignee: consignee.id,
                location: district.id,
                delivery_date: formattedDeliveryDate,
                contact_person_id: contact.id,
                remark: remark,
                track: false
            });
        });

        it('should update delivery when there is a delivery in the scope', function () {
            scope.delivery = createdTrackedDelivery;
            scope.save(true);
            scope.$apply();
            expect(mockDeliveryService.createPlan).not.toHaveBeenCalled();
            expect(mockDeliveryService.update).toHaveBeenCalledWith(createdTrackedDelivery);
        });

        it('should not create delivery if all purchase order items have quantityShipped as zero', function () {
            scope.purchaseOrderItems = [{quantityShipped: 0, isInvalid: valid}, {quantityShipped: 0, isInvalid: valid}];
            scope.save(true);
            scope.$apply();

            expect(mockDeliveryService.createPlan).not.toHaveBeenCalled();
            var errorMessage = 'Cannot save delivery with zero quantity shipped';
            expect(toast.create).toHaveBeenCalledWith({content: errorMessage, class: 'danger'});
        });

        it('should create delivery when one of the nodes has undefined quantityShipped but other have non-zero quantityShipped', function () {
            scope.purchaseOrderItems = [{isInvalid: valid}, {quantityShipped: 10, isInvalid: valid}];
            scope.save(true);
            scope.$apply();

            expect(mockDeliveryService.createPlan).toHaveBeenCalledWith({
                programme: programmeId,
                consignee: consignee.id,
                location: district.id,
                delivery_date: formattedDeliveryDate,
                contact_person_id: contact.id,
                remark: remark,
                track: true
            });
            expect(toast.create).toHaveBeenCalledWith({content: 'Delivery created', class: 'success'})
        });

        it('should create tracked delivery nodes for each purchase order item when delivery is empty', function () {
            scope.save(true);
            scope.$apply();

            var createNodeArgs = mockDeliveryNodeService.create.calls.allArgs();
            expect(mockDeliveryNodeService.create.calls.count()).toBe(2);
            expect(JSON.stringify(createNodeArgs.first().first())).toEqual(JSON.stringify(nodeOne));
            expect(JSON.stringify(createNodeArgs.last().first())).toEqual(JSON.stringify(nodeTwo));
        });

        xit('should update delivery nodes on scope when save is called with create = falsy', function () {
            scope.delivery = createdTrackedDelivery;
            scope.save();
            scope.$apply();

            var createNodeArgs = mockDeliveryNodeService.update.calls.allArgs();
            expect(mockDeliveryNodeService.update.calls.count()).toBe(2);
            expect(JSON.stringify(createNodeArgs.first().first())).toEqual(JSON.stringify(nodeOne));
            expect(JSON.stringify(createNodeArgs.last().first())).toEqual(JSON.stringify(nodeTwo));
        });

        it('should create untracked nodes when save is called with falsy', function() {
            var untrackedCreatedDelivery = Object.clone(createdTrackedDelivery);
            untrackedCreatedDelivery.track = false;
            var untrackedNodeOne = Object.merge(nodeOne, {track: false, distributionPlan: untrackedCreatedDelivery});
            var untrackedNodeTwo = Object.merge(nodeTwo, {track: false, distributionPlan: untrackedCreatedDelivery});
            mockDeliveryService.createPlan.and.returnValue(q.when(untrackedCreatedDelivery));

            scope.save();
            scope.$apply();

            var createNodeArgs = mockDeliveryNodeService.create.calls.allArgs();
            expect(mockDeliveryNodeService.create.calls.count()).toBe(2);
            expect(JSON.stringify(createNodeArgs.first().first())).toEqual(JSON.stringify(untrackedNodeOne));
            expect(JSON.stringify(createNodeArgs.last().first())).toEqual(JSON.stringify(untrackedNodeTwo));
        });

        it('should not create nodes for purchase order items with zero distributed quantity', function () {
            itemOne.quantityShipped = 0;
            scope.save(true);
            scope.$apply();

            var createNodeArgs = mockDeliveryNodeService.create.calls.allArgs();
            expect(mockDeliveryNodeService.create.calls.count()).toBe(1);
            expect(JSON.stringify(createNodeArgs.first().first())).toEqual(JSON.stringify(nodeTwo));
        });

        it('should alert user when creation of delivery fails', function () {
            mockDeliveryService.createPlan.and.returnValue(q.reject());
            scope.save(true);
            scope.$apply();

            expect(toast.create).toHaveBeenCalledWith({content: 'Save failed', class: 'danger'});
        });

        it('should alert user when creation of delivery nodes fails', function () {
            mockDeliveryNodeService.create.and.returnValue(q.reject());
            scope.save(true);
            scope.$apply();

            expect(toast.create).toHaveBeenCalledWith({content: 'Save failed', class: 'danger'});
        });

        it('should mark purchase order as singleIP and save it', function () {
            scope.save(true);
            scope.$apply();

            var purchaseOrderPatch = {id: purchaseOrder.id, isSingleIp: true};
            expect(mockPurchaseOrderService.update).toHaveBeenCalledWith(purchaseOrderPatch, 'PATCH');
        });

        it('should show loader during save and hide it after', function () {
            scope.save(true);
            scope.$apply();

            expect(mockLoader.modal.calls.allArgs()).toContain([], ['hide']);
            expect(mockLoader.modal.calls.count()).toBe(6);
        });

        describe('successfully with track = true', function () {
            it('reload purchase order and purchase order items on scope', function () {
                var newPurchaseOrder = {id: 15, purchaseorderitemSet: []};
                mockPurchaseOrderService.get.and.returnValue(q.when(newPurchaseOrder));

                scope.save(true);
                scope.$apply();

                expect(mockPurchaseOrderService.get.calls.count()).toBe(2);
                expect(mockPurchaseOrderService.get.calls.mostRecent().args).toEqual(
                    [purchaseOrder.id, ['purchaseorderitem_set.item']]
                );
                expect(scope.purchaseOrder).toEqual(newPurchaseOrder);
                expect(scope.purchaseOrderItems).toEqual([]);
            });
        });

    });

    function makeScopeFixture() {
        consignee = {id: 1};
        district = {id: 'Kampala'};
        deliveryDate = 'Mon Jun 29 2015 00:00:00 GMT+0300 (EAT)';
        formattedDeliveryDate = moment(new Date(deliveryDate)).format('YYYY-MM-DD');
        contact = {id: 3};
        remark = 'Some remarks';
        itemOne = purchaseOrderItems[0];
        itemTwo = purchaseOrderItems[1];
    }

    function setScopeData() {
        scope.delivery = {};
        scope.delivery.consignee = consignee.id;
        scope.delivery.location = district.id;
        scope.delivery.delivery_date = deliveryDate;
        scope.delivery.contact_person_id = contact.id;
        scope.delivery.remark = remark;
        scope.purchaseOrderItems = [itemOne, itemTwo];
    }
});
