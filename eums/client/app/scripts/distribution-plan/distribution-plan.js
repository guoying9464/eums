'use strict';


angular.module('DistributionPlan', ['Contact', 'eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'SalesOrder'])
    .controller('DistributionPlanController', function ($scope, ContactService, $location, DistributionPlanService, ProgrammeService, SalesOrderService, $sorter) {

        $scope.sortBy = $sorter;
        $scope.contact = {};
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.salesOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.initialize = function () {
            this.sortBy('order_number');
            this.sort.descending = false;

            SalesOrderService.getSalesOrders().then(function (salesOrders) {
                $scope.salesOrders = salesOrders;
            });
        };

        $scope.sortArrowClass = function (criteria) {
            var output = '';

            if (this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if (this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.selectSalesOrder = function (selectedSalesOrder) {
            $location.path('/delivery-report/new/' + selectedSalesOrder.id);
        };

        $scope.showDistributionPlan = function (planId) {
            $scope.planId = planId;
        };
    }).factory('DistributionPlanService', function ($http, $q, EumsConfig, DistributionPlanNodeService) {
        var fillOutNode = function (nodeId, plan) {
            return DistributionPlanNodeService.getPlanNodeDetails(nodeId)
                .then(function (nodeDetails) {
                    plan.nodeList.push(nodeDetails);
                });
        };

        var buildNodeTree = function (plan) {
            var rootNode = plan.nodeList.filter(function (node) {
                return node.parent === null;
            })[0];

            if (rootNode) {
                plan.nodeTree = addChildrenDetail(rootNode, plan);
                delete plan.nodeList;
            }
        };

        var addChildrenDetail = function (node, plan) {
            if (node) {
                node.temporaryChildrenList = [];
                node.children.forEach(function (childNodeId) {
                    var descendant = findDetailedNode(childNodeId, plan);
                    node.temporaryChildrenList.push(descendant);
                    addChildrenDetail(descendant, plan);
                });
                node.children = node.temporaryChildrenList;
                delete node.temporaryChildrenList;
                return node;
            }
        };

        var findDetailedNode = function (nodeId, plan) {
            return plan.nodeList.filter(function (node) {
                return node.id === nodeId;
            })[0];
        };

        return {
            fetchPlans: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN);
            },
            getSalesOrders: function () {
                return $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER);

            },
            getNodes: function (plan) {
                var distributionPlanNodesPromises = plan.distributionplannode_set.map(function (nodeId) {
                    return DistributionPlanNodeService.getPlanNodeById(nodeId);
                });
                return $q.all(distributionPlanNodesPromises);
            },
            getAllPlansNodes: function () {
                var self = this, mergedPromises = [];
                return self.fetchPlans().then(function (response) {
                    var nodePlanPromises = response.data.map(function (plan) {
                        return self.getNodes(plan);
                    });

                    return $q.all(nodePlanPromises).then(function (nodePlans) {
                        return mergedPromises.concat.apply(mergedPromises, nodePlans);
                    });
                });
            },

            getConsigneeDetails: function (consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.RESPONSES + consigneeId + '/');
            },
            getAllConsigneeResponses: function () {
                return $http.get(EumsConfig.BACKEND_URLS.RESPONSES);
            },
            getImplementingPartners: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?search=implementing_partner');
            },
            getMiddleMen: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?search=middle_man').then(function (response) {
                    return response.data;
                });
            },
            mapUnicefIpsWithConsignees: function () {
                var self = this;
                return self.getImplementingPartners().then(function (response) {
                    var ipsPromises = response.data.map(function (ipNode) {
                        return {
                            ip: ipNode,
                            consignees: self.getMiddleMen().then(function (response) {
                                var consigneePromises = response.filter(function (childNode) {
                                    return childNode.parent === ipNode.id;
                                });
                                return $q.all(consigneePromises).then(function (consignees) {
                                    return consignees.map(function (consignee) {
                                        return {
                                            consignee: consignee,
                                            answers: $q.all(self.getAllConsigneeResponses().then(function (response) {
                                                return response.data.filter(function (answer) {
                                                    return answer.node === consignee.id;
                                                });
                                            }))
                                        };
                                    });
                                });
                            })
                        };
                    });
                    return $q.all(ipsPromises);
                });
            },
            getNodesBy: function (ipId) {
                return this.getAllPlansNodes().then(function (nodes) {
                    return nodes.filter(function (node) {
                        return parseInt(node.data.parent) === parseInt(ipId);
                    });
                });
            },
            getPlanById: function (planId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN + planId + '/');
            },
            getPlanDetails: function (planId) {
                var getPlanPromise = this.getPlanById(planId);
                return getPlanPromise.then(function (response) {
                    var plan = response.data;
                    var nodeFillOutPromises = [];

                    plan.nodeList = [];
                    plan.distributionplannode_set.forEach(function (nodeId) {
                        nodeFillOutPromises.push(fillOutNode(nodeId, plan));
                    });

                    return $q.all(nodeFillOutPromises).then(function () {
                        buildNodeTree(plan);
                        return plan;
                    });
                });
            },
            createPlan: function (planDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN, planDetails).then(function (response) {
                    if (response.status === 201) {
                        return response.data;
                    }
                    else {
                        return {error: response};
                    }
                });
            }
        };
    })
    .directive('ordersTable', [function () {
        return {
            controller: 'DistributionPlanController',
            restrict: 'E',
            scope: {
                onSelect: '&',
                actionable: '@'
            },
            templateUrl: '/static/app/views/distribution-planning/partials/view-sales-orders.html',
            link: function (scope) {
                console.log(scope);
                scope.addContact = function () {

                    console.log('hihi');
//            ContactService.addContact($scope.contact).then(function () {
//                $location.path('/');
//            }, function (error) {
//                $scope.errorMessage = error.data.error;
//            });
                };
            }
        };
    }]).filter('salesOrderFilter', function ($filter) {
        return  function (salesOrders, query) {
            var results = $filter('filter')(salesOrders, {order_number: query});
            results = _.union(results, $filter('filter')(salesOrders, {date: query}));
            results = _.union(results, $filter('filter')(salesOrders, {description: query}));
            return results;
        };
    }).factory('$sorter', function () {
        return function (field) {
            this.sort = this.sort || {};
            angular.extend(this.sort, {criteria: field, descending: !this.sort.descending});
        };
    })
;

