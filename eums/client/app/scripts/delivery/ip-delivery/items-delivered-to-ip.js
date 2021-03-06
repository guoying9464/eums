angular.module('ItemsDeliveredToIp', ['eums.config', 'ngTable', 'siTable', 'Loader', 'Delivery', 'DeliveryNode', 'Answer'])
    .controller('ItemsDeliveredToIpController', function ($scope, $routeParams, $location, $q, LoaderService,
                                                        DeliveryService, DeliveryNodeService, AnswerService) {

        $scope.activeDelivery = {};
        $scope.combinedDeliveryNodes = [];

        loadData();

        $scope.saveAnswers = function () {
            LoaderService.showLoader();
            var answerPromises = [];
            $scope.combinedDeliveryNodes.forEach(function (node) {
                var answers = (node.answers.first().value == 'No') ? [node.answers.first()] : node.answers;
                answerPromises.push(AnswerService.createWebAnswer(node, answers))
            });

            $q.all(answerPromises).then(function () {
                $location.path('/ip-deliveries');
            }).finally(function () {
                LoaderService.hideLoader();
            });
        };

        $scope.$watch('combinedDeliveryNodes', function () {
            var areValid = [];
            $scope.combinedDeliveryNodes.forEach(function (node) {
                if (node.answers.first().value == 'No') {
                    node.answers[1].value = '0';
                    node.answers[2].value = 'Incomplete';
                    node.answers[3].value = 'No';
                }
                areValid.push(areValidAnswers(node.answers));
            });

            $scope.areValidAnswers = areValid.indexOf(false) <= -1;
        }, true);

        $scope.addRemark = function (index) {
            var remarksModalId = 'add-remark-answer-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        function areValidAnswers(nodeAnswers) {
            var isValid = [];
            nodeAnswers.forEach(function (nodeAnswer) {
                if (nodeAnswer.question_label == 'additionalDeliveryComments') {
                    isValid.add(true);
                } else {
                    if (nodeAnswer.type == 'multipleChoice') {
                        isValid.add(nodeAnswer.options.indexOf(nodeAnswer.value) > -1);
                    } else if (nodeAnswer.type == 'text') {
                        isValid.add(nodeAnswer.value !== '');
                    } else if (nodeAnswer.type == 'numeric') {
                        isValid.add(!isNaN(nodeAnswer.value) && nodeAnswer.value !== '' && nodeAnswer.value.valueOf() >= 0)
                    }
                }
            });
            return isValid.indexOf(false) <= -1;
        }

        function setDefaultAnswers(deliveryAnswers) {
            deliveryAnswers.forEach(function (answer) {
                if (answer.question_label == 'isDeliveryInGoodOrder') {
                    $scope.defaultItemCondition = answer.value == 'Yes' ? 'Good' : '';
                }

                if (answer.question_label == 'satisfiedWithDelivery') {
                    $scope.isSatisfied = answer.value;
                }

            })
        }

        function combineNodeAnswers(nodeAnswers) {
            $scope.combinedDeliveryNodes = [];
            if ($scope.deliveryNodes) {
                $scope.deliveryNodes.forEach(function (node) {
                    var result = nodeAnswers.filter(function (answerSet) {
                        if (answerSet.id == node.id) {
                            answerSet.answers[0].value = answerSet.answers[0].value || "Yes";
                            answerSet.answers[1].value = answerSet.answers[1].value || node.quantityIn.toString();
                            answerSet.answers[2].value = answerSet.answers[2].value || $scope.defaultItemCondition;
                            answerSet.answers[3].value = answerSet.answers[3].value || $scope.isSatisfied;
                            return true;
                        }
                        return false;
                    });

                    if (result && result.length > 0) {
                        var deliveryNode = Object.merge(node, {answers: result[0].answers});
                        $scope.combinedDeliveryNodes.push(deliveryNode);
                    }
                });
            }
        }

        function loadData() {
            LoaderService.showLoader();
            DeliveryService.get($routeParams.activeDeliveryId)
                .then(function (delivery) {
                    $scope.shipmentDate = delivery.deliveryDate;
                    $scope.totalValue = delivery.totalValue;
                    $scope.activeDelivery = delivery;
                }).then(function () {
                    DeliveryNodeService.filter({distribution_plan: $scope.activeDelivery.id})
                        .then(function (nodes) {
                            $scope.deliveryNodes = nodes;
                        }).then(function () {
                            DeliveryService.getDetail($scope.activeDelivery, 'answers')
                                .then(function (deliveryAnswers) {
                                    setDefaultAnswers(deliveryAnswers);
                                    DeliveryService.getDetail($scope.activeDelivery, 'node_answers')
                                        .then(function (answers) {
                                            combineNodeAnswers(answers);
                                        })
                                })
                                .finally(function () {
                                    LoaderService.hideLoader();
                                });
                        })
                })
        }
    });