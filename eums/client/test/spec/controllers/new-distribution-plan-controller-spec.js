describe('NewDistributionPlanController', function () {

    beforeEach(module('NewDistributionPlan'));
    var mockNodeService, mockIPService, mockPlanService, mockSalesOrderItemService,
        mockLineItemService, mockConsigneeService, mockSalesOrderService;
    var deferred, deferredPlan, deferredDistrictPromise, deferredTopLevelLineItems,
        deferredPlanNode, deferredSalesOrder, deferredLineItem;
    var scope, q, mockToastProvider, location;

    var orderNumber = '00001';
    var plainDistricts = ['Abim', 'Gulu'];

    var salesOrders = [
        {
            id: 1,
            'programme': {
                id: 3,
                name: 'Alive'
            },
            'order_number': orderNumber,
            'date': '2014-10-05',
            'salesorderitem_set': ['1']
        },
        {
            id: 2,
            'programme': {
                id: 4,
                name: 'Alive'
            },
            'order_number': '22221',
            'date': '2014-10-05',
            'salesorderitem_set': [3, 4]
        }
    ];

    var stubSalesOrderItem = {
        id: 1,
        sales_order: '1',
        information: {
            id: 1,
            item: {
                id: 1,
                description: 'Test Item',
                material_code: '12345AS',
                unit: {
                    name: 'EA'
                }
            },
            quantity: 100,
            quantity_left: 100
        },
        quantity: 100,
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        distributionplanlineitem_set: [1, 2]
    };

    var stubSalesOrderItemNoDistributionPlanLineItems = {
        id: 1,
        sales_order: '1',
        information: {
            item: {
                id: 1,
                description: 'Test Item',
                material_code: '12345AS',
                unit: {
                    name: 'EA'
                }
            }
        },
        quantity: '100',
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        distributionplanlineitem_set: []
    };

    var expectedFormattedSalesOrderItem = {
        display: stubSalesOrderItem.information.item.description,
        materialCode: stubSalesOrderItem.information.item.material_code,
        quantity: stubSalesOrderItem.quantity,
        quantityLeft: stubSalesOrderItem.information.quantity_left,
        unit: stubSalesOrderItem.information.item.unit.name,
        information: stubSalesOrderItem.information
    };

    var setUp = function (routeParams) {
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'getSalesOrders', 'createPlan']);
        mockLineItemService = jasmine.createSpyObj('mockLineItemService', ['getLineItem', 'createLineItem', 'updateLineItem']);
        mockNodeService = jasmine.createSpyObj('mockNodeService', ['getPlanNodeDetails', 'createNode', 'updateNode']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['getConsigneeById', 'fetchConsignees']);
        mockIPService = jasmine.createSpyObj('mockIPService', ['loadAllDistricts']);
        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['getSalesOrder']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem', 'getTopLevelDistributionPlanLineItems']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['createPlan']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);

        inject(function ($controller, $rootScope, $q, $location) {
            q = $q;
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredDistrictPromise = $q.defer();
            deferredPlanNode = $q.defer();
            deferredLineItem = $q.defer();
            deferredTopLevelLineItems = $q.defer();
            deferredSalesOrder = $q.defer();
            mockLineItemService.getLineItem.and.returnValue(deferredLineItem.promise);
            mockLineItemService.createLineItem.and.returnValue(deferred.promise);
            mockNodeService.getPlanNodeDetails.and.returnValue(deferredPlanNode.promise);
            mockNodeService.createNode.and.returnValue(deferredPlanNode.promise);
            mockConsigneeService.getConsigneeById.and.returnValue(deferred.promise);
            mockConsigneeService.fetchConsignees.and.returnValue(deferred.promise);
            mockSalesOrderService.getSalesOrder.and.returnValue(deferredSalesOrder.promise);
            mockSalesOrderItemService.getSalesOrderItem.and.returnValue(deferred.promise);
            mockSalesOrderItemService.getTopLevelDistributionPlanLineItems.and.returnValue(deferredTopLevelLineItems.promise);
            mockIPService.loadAllDistricts.and.returnValue(deferredDistrictPromise.promise);

            location = $location;
            scope = $rootScope.$new();

            $controller('NewDistributionPlanController',
                {
                    $scope: scope,
                    $location: location,
                    $q: q,
                    $routeParams: routeParams,
                    SalesOrderItemService: mockSalesOrderItemService,
                    DistributionPlanLineItemService: mockLineItemService,
                    DistributionPlanService: mockPlanService,
                    DistributionPlanNodeService: mockNodeService,
                    ConsigneeService: mockConsigneeService,
                    SalesOrderService: mockSalesOrderService,
                    IPService: mockIPService,
                    ngToast: mockToastProvider
                });
        });
    };
    beforeEach(function () {
        setUp({salesOrderId: 1});
    });

    describe('adding a contact', function () {
        describe('with invalid fields', function () {
           it('should be invalid when no number is supplied', function () {
               scope.contact = {
                   firstName: 'Dude',
                   lastName: 'Awesome',
                   phone: ''
               };
               scope.$apply();

               expect(scope.invalidContact(scope.contact)).toBeTruthy();
           });

           it('should be invalid when no first name is supplied', function () {
               scope.contact = {
                   firstName: '',
                   lastName: 'Awesome',
                   phone: '+256782555444'
               };
               scope.$apply();

               expect(scope.invalidContact(scope.contact)).toBeTruthy();
           });

           it('should be invalid when no last name is supplied', function () {
               scope.contact = {
                   firstName: 'Dudette',
                   lastName: '',
                   phone: '+256782555444'
               };
               scope.$apply();

               expect(scope.invalidContact(scope.contact)).toBeTruthy();
           });
        });

        describe('with valid fields', function () {
            it('should be valid when full name and phone number are supplied', function () {
                scope.contact = {
                    firstName: 'Dudette',
                    lastName: 'Awesome',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeFalsy();
            });
        });
    });

    describe('when distributionPlanLineItems list on scope changes, ', function () {
        it('the selected sales order item quantityLeft attribute should be updated', function () {
            scope.selectedSalesOrderItem = {quantity: 100, information: stubSalesOrderItem};
            scope.$apply();

            scope.distributionPlanLineItems.push({targetQuantity: 50});
            scope.$apply();
            expect(scope.selectedSalesOrderItem.quantityLeft).toBe(50);

            scope.distributionPlanLineItems[0].targetQuantity = 25;
            scope.$apply();
            expect(scope.selectedSalesOrderItem.quantityLeft).toBe(75);
        });

        describe('disabling save with invalidLineItems field', function () {
            var invalidLineItem;
            var validLineItem = {
                item: 1,
                plannedDistributionDate: '2014-11-31',
                targetQuantity: 42,
                consignee: 4,
                destinationLocation: 'Adjumani',
                contactPerson: '5444d433ec8e8257ae48dc73',
                modeOfDelivery: 'Warehouse',
                remark: '',
                tracked: true,
                forEndUser: false
            };

            beforeEach(function () {
                scope.selectedSalesOrderItem = {
                    quantity: 100,
                    information: {id: 1}
                };
                scope.distributionPlanLineItems = [];
                scope.$apply();
            });

            it('sets the invalidLineItems field to false when there are no invalid line items', function () {
                scope.distributionPlanLineItems.push(validLineItem);
                scope.$apply();

                expect(scope.invalidLineItems).toBeFalsy();
            });

            it('sets the invalidLineItems field to true when there are line items with invalid target Quanitities', function () {
                invalidLineItem = angular.copy(validLineItem);
                invalidLineItem.targetQuantity = -1;
                scope.distributionPlanLineItems.push(invalidLineItem);
                scope.$apply();

                expect(scope.invalidLineItems).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when there are line items with no consignee', function () {
                invalidLineItem = angular.copy(validLineItem);
                delete invalidLineItem.consignee;
                scope.distributionPlanLineItems.push(invalidLineItem);
                scope.$apply();

                expect(scope.invalidLineItems).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when there are line items with no destinationLocation', function () {
                invalidLineItem = angular.copy(validLineItem);
                invalidLineItem.destinationLocation = '';
                scope.distributionPlanLineItems.push(invalidLineItem);
                scope.$apply();

                expect(scope.invalidLineItems).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when there are line items with no contactPerson', function () {
                invalidLineItem = angular.copy(validLineItem);
                invalidLineItem.contactPerson = '';
                scope.distributionPlanLineItems.push(invalidLineItem);
                scope.$apply();

                expect(scope.invalidLineItems).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when there are line items with no modeOfDelivery', function () {
                invalidLineItem = angular.copy(validLineItem);
                invalidLineItem.modeOfDelivery = '';
                scope.distributionPlanLineItems.push(invalidLineItem);
                scope.$apply();

                expect(scope.invalidLineItems).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when there are line items with no plannedDistributionDate', function () {
                invalidLineItem = angular.copy(validLineItem);
                invalidLineItem.plannedDistributionDate = '';
                scope.distributionPlanLineItems.push(invalidLineItem);
                scope.$apply();

                expect(scope.invalidLineItems).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when the quantity left of salesitems is less than 0', function () {
                invalidLineItem = angular.copy(validLineItem);
                invalidLineItem.targetQuantity = 101;
                scope.distributionPlanLineItems.push(invalidLineItem);
                scope.$apply();

                expect(scope.invalidLineItems).toBeTruthy();
            });
        });
    });

    describe('when the controller is initialized', function () {
        beforeEach(function () {
            deferredDistrictPromise.resolve({data: plainDistricts});
        });

        it('should have the distributionPlanLineItems defaulted to an empty list', function () {
            expect(scope.distributionPlanLineItems).toEqual([]);
        });

        it('should set districts in the scope variable', function () {
            var expectedDistricts = [
                {id: 'Abim', name: 'Abim'},
                {id: 'Gulu', name: 'Gulu'}
            ];
            scope.$apply();

            expect(scope.districts).toEqual(expectedDistricts);
        });

        it('should have the selected sales orders in the scope', function () {
            deferredSalesOrder.resolve(salesOrders[0]);
            scope.$apply();

            expect(scope.selectedSalesOrder).toEqual(salesOrders[0]);
        });

        it('should have the default selected sales orders item undefined in the scope', function () {
            scope.$apply();

            expect(scope.selectedSalesOrderItem).toBeUndefined();
        });

        it('should format the selected sales order appropriately for the view', function () {
            var stubItem = {
                id: 1,
                item: {
                    id: 1,
                    description: 'Test Item',
                    material_code: '12345AS',
                    unit: {
                        name: 'EA'
                    }
                },
                quantity: 100,
                quantity_left: 100
            };
            deferred.resolve(stubItem);
            deferredSalesOrder.resolve(salesOrders[0]);
            scope.$apply();

            expect(scope.salesOrderItems).toEqual([expectedFormattedSalesOrderItem]);
        });

    });

    describe('when sales order item selected changes, ', function () {

        it('should set the selected sales order to the scope when sales order item is selected', function () {
            scope.selectedSalesOrderItem = expectedFormattedSalesOrderItem;
            scope.$apply();
            expect(scope.selectedSalesOrderItem).toEqual(expectedFormattedSalesOrderItem);
        });

        xit('should put a distribution plan on the scope if sales order item has associated distribution plan line items', function () {
            deferred.resolve({distribution_plan_node: 1});
            scope.selectedSalesOrderItem = {information: {distributionplanlineitem_set: ['1']}};
            scope.$apply();

            expect(scope.distributionPlan).toEqual({id: 1, programme: 1});
        });

        it('should get distribution plan nodes for line items if line items exist', function () {
            setUp({salesOrderId: 1, distributionPlanNodeId: 1});

            deferred.resolve({distribution_plan_node: 1});
            scope.selectedSalesOrderItem = {information: {distributionplanlineitem_set: ['1']}};
            scope.$apply();
            expect(mockNodeService.getPlanNodeDetails).toHaveBeenCalledWith(1);
        });

        it('should put a distribution plan on the scope if distribution plan node exists', function () {
            setUp({salesOrderId: 1, distributionPlanNodeId: 1});

            deferredLineItem.resolve({});
            deferredPlanNode.resolve({distribution_plan: 2, distributionplanlineitem_set: [1]});
            scope.$apply();

            expect(scope.distributionPlan).toEqual(2);
        });

        it('should call the get distribution plan items service linked to the particular sales order item', function () {
            deferred.resolve(stubSalesOrderItem);
            deferredTopLevelLineItems.resolve(stubSalesOrderItem.distributionplanlineitem_set);

            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.information.item.description,
                materialCode: stubSalesOrderItem.information.item.materialCode, quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.information.item.unit.name, information: stubSalesOrderItem
            };
            scope.$apply();

            expect(mockLineItemService.getLineItem).toHaveBeenCalledWith(1);
            expect(mockLineItemService.getLineItem).toHaveBeenCalledWith(2);
        });

        it('should put the distribution plan items linked to the particular sales order item on the scope', function () {
            deferredPlanNode.resolve({
                consignee: {
                    name: 'Save the Children'
                },
                location: 'Kampala',
                contact_person: {_id: 1}
            });
            var stubLineItem = {id: 1};
            deferred.resolve(stubSalesOrderItem);
            deferredLineItem.resolve(stubLineItem);
            deferredTopLevelLineItems.resolve(stubSalesOrderItem.distributionplanlineitem_set);

            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.information.item.description,
                materialCode: stubSalesOrderItem.information.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.information.item.unit.name,
                information: stubSalesOrderItem
            };
            scope.$apply();

            expect(scope.distributionPlanLineItems).toEqual([stubLineItem, stubLineItem]);
        });

        it('should not get distribution plan line items if there are no ui line items', function () {

            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItemNoDistributionPlanLineItems.information.item.description,
                material_code: stubSalesOrderItemNoDistributionPlanLineItems.information.item.material_code,
                quantity: stubSalesOrderItemNoDistributionPlanLineItems.quantity,
                unit: stubSalesOrderItemNoDistributionPlanLineItems.information.item.unit.name,
                information: stubSalesOrderItemNoDistributionPlanLineItems
            };
            scope.$apply();

            expect(scope.distributionPlanLineItems).toEqual([]);
        });

        it('should not get distribution plan items service linked to the particular sales order item with undefined line item set', function () {

            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.information.item.description,
                material_code: stubSalesOrderItem.information.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                item: stubSalesOrderItem.information.item,
                information: {}
            };
            scope.$apply();

            expect(scope.distributionPlanLineItems).toEqual([]);
        });
    });

    describe('when Add Consignee button is clicked', function () {
        it('should add a default distribution plan line item to the selectedSalesOrderItem', function () {
            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.information.item.description,
                materialCode: stubSalesOrderItem.information.item.material_code,
                quantity: 100,
                quantityLeft: stubSalesOrderItem.quantity,
                item: stubSalesOrderItem.information.item,
                information: stubSalesOrderItem,
                distributionplanlineitem_set: stubSalesOrderItem.information.distributionplanlineitem_set
            };
            scope.$apply();

            var expectedPlanItem = {
                item: stubSalesOrderItem.information.item.id,
                plannedDistributionDate: '',
                targetQuantity: 0,
                destinationLocation: '',
                modeOfDelivery: '',
                remark: '',
                contactPerson: '',
                tracked: false,
                forEndUser: false
            };

            scope.addDistributionPlanItem();
            scope.$apply();

            expect(scope.distributionPlanLineItems).toEqual([expectedPlanItem]);
        });
    });

    describe('when save is clicked, ', function () {
        var programmeId, distributionPlan;

        beforeEach(function () {
            var createPlanPromise = q.defer();
            distributionPlan = {id: 1};
            createPlanPromise.resolve(distributionPlan);
            mockPlanService.createPlan.and.returnValue(createPlanPromise.promise);

            programmeId = 42;
            scope.selectedSalesOrder = {programme: {id: programmeId}};
            scope.selectedSalesOrderItem = {quantity: 100, information: stubSalesOrderItem};
            scope.$apply();
        });

        describe('and the plan is successfully saved, ', function () {
            it('a toast confirming the save action should be created', function () {
                scope.saveDistributionPlanLineItems();
                scope.$apply();

                var expectedToastArguments = {
                    content: 'Plan Saved!',
                    class: 'success',
                    maxNumber: 1,
                    dismissOnTimeout: true
                };
                expect(mockToastProvider.create).toHaveBeenCalledWith(expectedToastArguments);
            });

            it('puts a promise on the scope to notify the ui that saving is done', function () {
                scope.saveDistributionPlanLineItems();
                scope.$apply();

                expect(scope.savePlanPromise.then).toBeTruthy();
            });
        });

        describe('and a plan for the sales order item has not been saved, ', function () {
            it('a distribution plan should be created', function () {
                scope.saveDistributionPlanLineItems();
                scope.$apply();

                expect(mockPlanService.createPlan).toHaveBeenCalledWith({programme: programmeId});
            });
            it('the created distribution plan should be put on the scope', function () {
                scope.saveDistributionPlanLineItems();
                scope.$apply();

                expect(scope.distributionPlan).toEqual(distributionPlan.id);
            });
        });

        describe('and a plan for the sales order item has been saved, ', function () {
            it('a distribution plan should not be created', function () {
                scope.distributionPlan = {programme: 1};
                scope.$apply();

                scope.saveDistributionPlanLineItems();
                scope.$apply();

                expect(mockPlanService.createPlan).not.toHaveBeenCalled();
            });
        });

        describe('when saving a node and plan item, ', function () {
            var uiPlanItem;
            var distributionDateFormatedForSave = '2014-2-3';

            beforeEach(function () {
                uiPlanItem = {
                    consignee: 1,
                    destinationLocation: 'Kampala',
                    contactPerson: '0489284',
                    distributionPlan: 1,
                    tree_position: 'MIDDLE_MAN',
                    modeOfDelivery: 'WAREHOUSE',
                    item: 1,
                    targetQuantity: 10,
                    plannedDistributionDate: '02/03/2014',
                    remark: 'Remark'
                };

                scope.distributionPlanLineItems = [uiPlanItem];
                scope.$apply();
            });

            describe(' and a distribution plan item has not been saved before, ', function () {
                var nodeId;
                beforeEach(function () {
                    nodeId = 1;
                    deferredPlanNode.resolve({id: nodeId});
                });

                it('a node for the plan item should be saved with no parent id as implementing partner', function () {
                    scope.saveDistributionPlanLineItems();
                    scope.$apply();

                    expect(mockNodeService.createNode).toHaveBeenCalledWith({
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'IMPLEMENTING_PARTNER',
                        mode_of_delivery: 'WAREHOUSE',
                        parent: null
                    });
                });

                it('should save node with middle man user tree position', function () {
                    uiPlanItem.forEndUser = false;
                    scope.planNode = {id: 1};
                    scope.saveDistributionPlanLineItems();
                    scope.$apply();

                    expect(mockNodeService.createNode).toHaveBeenCalledWith({
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'MIDDLE_MAN',
                        mode_of_delivery: 'WAREHOUSE',
                        parent: 1
                    });
                });

                it('should save node with end user tree position', function () {
                    uiPlanItem.forEndUser = true;

                    scope.saveDistributionPlanLineItems();
                    scope.$apply();

                    expect(mockNodeService.createNode).toHaveBeenCalledWith({
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'END_USER',
                        mode_of_delivery: 'WAREHOUSE',
                        parent: null
                    });
                });

                it(' the saved node id should be put on the ui plan item', function () {
                    scope.saveDistributionPlanLineItems();
                    scope.$apply();

                    expect(uiPlanItem.nodeId).toBe(nodeId);
                });

                it('a distribution plan line item linked to a saved node should be saved', function () {
                    scope.saveDistributionPlanLineItems();
                    scope.$apply();

                    expect(mockLineItemService.createLineItem).toHaveBeenCalledWith({
                        item: uiPlanItem.item,
                        targeted_quantity: uiPlanItem.targetQuantity,
                        distribution_plan_node: nodeId,
                        planned_distribution_date: distributionDateFormatedForSave,
                        remark: uiPlanItem.remark
                    });
                });

                it(' the saved line item id should be put on the ui plan item', function () {
                    var lineItemId = 1;
                    var createLineItemPromise = q.defer();
                    createLineItemPromise.resolve({id: lineItemId});
                    mockLineItemService.createLineItem.and.returnValue(createLineItemPromise.promise);

                    scope.saveDistributionPlanLineItems();
                    scope.$apply();

                    expect(uiPlanItem.lineItemId).toBe(lineItemId);
                });


            });

            describe(' and a distribution plan item has already been saved, ', function () {
                var nodeId, deferred;

                beforeEach(inject(function ($q) {
                    nodeId = 1;
                    deferredPlanNode.resolve({id: nodeId});

                    deferred = $q.defer();
                    deferred.resolve({});
                    mockNodeService.updateNode.and.returnValue(deferred.promise);
                }));

                it('the node for the ui plan item should be updated and not saved', function () {
                    uiPlanItem.nodeId = nodeId;

                    scope.saveDistributionPlanLineItems();
                    scope.$apply();

                    expect(mockNodeService.updateNode).toHaveBeenCalledWith({
                        id: nodeId,
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'IMPLEMENTING_PARTNER',
                        mode_of_delivery: 'WAREHOUSE',
                        parent: null
                    });
                    expect(mockNodeService.createNode).not.toHaveBeenCalled();
                });

                it('the distribution plan line item should be updated and not saved', function () {
                    var lineItemId = 1;

                    uiPlanItem.lineItemId = lineItemId;

                    scope.saveDistributionPlanLineItems();
                    scope.$apply();

                    expect(mockLineItemService.createLineItem).not.toHaveBeenCalled();

                    expect(mockLineItemService.updateLineItem).toHaveBeenCalledWith({
                        id: lineItemId,
                        item: uiPlanItem.item,
                        targeted_quantity: uiPlanItem.targetQuantity,
                        distribution_plan_node: nodeId,
                        planned_distribution_date: distributionDateFormatedForSave,
                        remark: uiPlanItem.remark
                    });
                });
            });
        });

        describe('for sub-consignees', function () {
            var uiPlanItem;
            beforeEach(function () {
                uiPlanItem = {
                    consignee: 1,
                    destinationLocation: 'Kampala',
                    contactPerson: '0489284',
                    distributionPlan: 1,
                    tree_position: 'MIDDLE_MAN',
                    modeOfDelivery: 'WAREHOUSE',
                    item: 1,
                    targetQuantity: 10,
                    plannedDistributionDate: '2014-02-03',
                    remark: 'Remark'
                };

                scope.distributionPlanLineItems = [uiPlanItem];
                scope.planNode = {id: 42};
                scope.$apply();
            });

            it('a node for the plan item should be saved with parent node set', function () {
                scope.saveDistributionPlanLineItems();
                scope.$apply();

                expect(mockNodeService.createNode).toHaveBeenCalledWith({
                    consignee: 1,
                    location: 'Kampala',
                    contact_person_id: '0489284',
                    distribution_plan: 1,
                    tree_position: 'MIDDLE_MAN',
                    mode_of_delivery: 'WAREHOUSE',
                    parent: scope.planNode.id
                });
            });
        });
    });
});


