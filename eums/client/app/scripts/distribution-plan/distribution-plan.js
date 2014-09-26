'use strict';


angular.module('DistributionPlan', ['Contact', 'eums.config', 'DistributionPlanNode', 'FlowChart'])
    .controller('DistributionPlanController', function ($scope, ContactService, $location, DistributionPlanService, flowchart) {
        var chartDataModel = {nodes: [], connections: []};

        $scope.contact = {};
        $scope.errorMessage = '';

        $scope.distribution_plans = [];
        $scope.distribution_plan_details = [];


        $scope.initialize = function () {
            DistributionPlanService.fetchPlans().then(function (response) {
                $scope.distribution_plans = response.data;
            });
        };

        $scope.renderChart = function () {
            var nodeTree = $scope.distribution_plan_details.nodeTree;
            var nodeInformation = {
                name: nodeTree.consignee.name,
                id: nodeTree.id,
                x: 0,
                y: 0,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                    {
                        name: ''
                    }
                ] };
            chartDataModel.nodes.push(nodeInformation);

            buildTree(nodeTree, 0, 0);

        };

        var buildTree = function (node, x_variable, y_variable) {
            x_variable += 200;

            node.children.forEach(function (child) {
                var nodeInformation = {
                    name: child.consignee.name,
                    id: child.id,
                    x: x_variable,
                    y: y_variable,
                    inputConnectors: [
                        {
                            name: ''
                        }
                    ], outputConnectors: [
                        {
                            name: ''
                        }
                    ] };

                var connectionInformation = {
                    source: {
                        nodeID: child.parent,
                        connectorIndex: 0
                    },

                    dest: {
                        nodeID: child.id,
                        connectorIndex: 0
                    }
                };

                chartDataModel.nodes.push(nodeInformation);
                chartDataModel.connections.push(connectionInformation);
                buildTree(child, x_variable, y_variable);
                y_variable += 100;
            });
        };

        $scope.showDistributionPlan = function (planId) {
            chartDataModel = {nodes: [], connections: []};
            DistributionPlanService.getPlanDetails(planId).then(function (response) {
                if (response.nodeTree) {
                    $scope.distribution_plan_details = {'nodeTree': response.nodeTree, 'lineItems': response.nodeTree.lineItems};
                    $scope.renderChart();
                    $scope.chartViewModel = new flowchart.ChartViewModel(chartDataModel);
                }

            });
        };

        $scope.addContact = function () {
            ContactService.addContact($scope.contact).then(function () {
                $location.path('/');
            }, function (error) {
                $scope.errorMessage = error.data.error;
            });
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
            getPlanDetails: function (planId) {
                var getPlanPromise = $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN + planId + '/');
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
;

