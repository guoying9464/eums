from unittest import TestCase

from django.db import IntegrityError

from eums.models import Consignee, DistributionPlan, DistributionPlanNode, SalesOrder, PurchaseOrderItem, PurchaseOrder, \
    Programme, SalesOrderItem, ReleaseOrder
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory as NodeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class PurchaseOrderTest(TestCase):
    def setUp(self):
        self.clean_up()

    def tearDown(self):
        self.clean_up()

    def clean_up(self):
        DistributionPlan.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        DistributionPlanNode.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        Programme.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        SalesOrder.objects.all().delete()
        Consignee.objects.all().delete()
        ReleaseOrder.objects.all().delete()

    def test_no_two_purchase_orders_should_have_the_same_order_number(self):
        create_purchase_order = lambda: PurchaseOrderFactory(order_number=1234)
        create_purchase_order()
        self.assertRaises(IntegrityError, create_purchase_order)

    def test_should_know_if_it_has_a_distribution_plan_or_not(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        self.assertFalse(purchase_order.has_plan())
        NodeFactory(item=purchase_order_item)
        self.assertTrue(purchase_order.has_plan())

    def test_should_know_if_it_is_fully_delivered_or_not_using_only_tracked_nodes(self):
        purchase_order = PurchaseOrderFactory()

        item_one = PurchaseOrderItemFactory(purchase_order=purchase_order, quantity=100)
        item_two = PurchaseOrderItemFactory(purchase_order=purchase_order, quantity=100)
        self.assertFalse(purchase_order.is_fully_delivered())

        delivery = DeliveryFactory()
        node_one = NodeFactory(item=item_one, quantity=100, distribution_plan=delivery,
                               tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        self.assertFalse(purchase_order.is_fully_delivered())

        node_two = NodeFactory(item=item_two, quantity=100, distribution_plan=delivery,
                               tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        self.assertFalse(purchase_order.is_fully_delivered())

        delivery.track = True
        delivery.save()
        node_two.quantity = 50
        node_two.save()
        self.assertFalse(purchase_order.is_fully_delivered())

        node_two.quantity = 100
        node_two.save()
        self.assertTrue(purchase_order.is_fully_delivered())

    def test_should_return_empty_list_when_no_deliveries_tied_to_any_purchase_order_items(self):
        order = PurchaseOrderFactory()
        PurchaseOrderItemFactory(purchase_order=order)
        PurchaseOrderItemFactory(purchase_order=order)
        self.assertListEqual(list(order.deliveries()), [])

    def test_should_return_multiple_deliveries_along_with_their_corresponding_nodes(self):
        order = PurchaseOrderFactory()
        order_item_one = PurchaseOrderItemFactory(purchase_order=order)
        order_item_two = PurchaseOrderItemFactory(purchase_order=order)
        delivery_one = DeliveryFactory()
        delivery_two = DeliveryFactory()
        node_one = NodeFactory(item=order_item_one, distribution_plan=delivery_one)
        node_two = NodeFactory(item=order_item_two, distribution_plan=delivery_one)
        node_three = NodeFactory(item=order_item_one, distribution_plan=delivery_two)
        node_four = NodeFactory(item=order_item_two, distribution_plan=delivery_two)

        deliveries = order.deliveries()

        self.assertEqual(len(deliveries), 2)
        self.assertIn(delivery_one, list(deliveries))
        self.assertIn(delivery_two, list(deliveries))

        first_delivery_nodes = delivery_one.distributionplannode_set.all()
        second_delivery_nodes = delivery_two.distributionplannode_set.all()
        self.assertIn(node_one, first_delivery_nodes)
        self.assertIn(node_two, first_delivery_nodes)
        self.assertIn(node_three, second_delivery_nodes)
        self.assertIn(node_four, second_delivery_nodes)

    def test_should_get_track_status_if_delivery_is_sent_and_tracked_fully(self):
        order = PurchaseOrderFactory()
        order_item = PurchaseOrderItemFactory(purchase_order=order, quantity=100)
        self.assertEqual(order.track(), PurchaseOrder.NOT_TRACKED)

        delivery_one = DeliveryFactory(track=True)
        delivery_two = DeliveryFactory(track=True)
        NodeFactory(item=order_item, distribution_plan=delivery_one, quantity=50, track=True)
        NodeFactory(item=order_item, distribution_plan=delivery_two, quantity=50, track=True)
        self.assertEqual(order.track(), PurchaseOrder.FULLY_TRACKED)

    def test_should_get_track_status_if_delivery_is_sent_partially(self):
        order = PurchaseOrderFactory()
        order_item = PurchaseOrderItemFactory(purchase_order=order, quantity=100)
        delivery_one = DeliveryFactory(track=True)
        NodeFactory(item=order_item, distribution_plan=delivery_one, quantity=50, track=True)

        self.assertEqual(order.track(), PurchaseOrder.PARTIALLY_TRACKED)

    def test_should_get_track_status_if_delivery_is_just_saved(self):
        order = PurchaseOrderFactory()
        order_item = PurchaseOrderItemFactory(purchase_order=order, quantity=100)
        delivery_one = DeliveryFactory(track=False)
        NodeFactory(item=order_item, distribution_plan=delivery_one, quantity=100, track=False)

        self.assertEqual(order.track(), PurchaseOrder.NOT_TRACKED)

    def test_should_get_orders__as_a_queryset__whose_items_have_been_delivered_to_a_specific_consignee(self):
        consignee = ConsigneeFactory()
        order_one = PurchaseOrderFactory()
        order_two = PurchaseOrderFactory()
        order_three = PurchaseOrderFactory()
        order_item_one = PurchaseOrderItemFactory(purchase_order=order_one)
        order_item_two = PurchaseOrderItemFactory(purchase_order=order_two)
        NodeFactory(item=order_item_one, consignee=consignee)
        NodeFactory(item=order_item_two, consignee=consignee)

        consignee_orders = PurchaseOrder.objects.for_consignee(consignee.id).order_by('id')

        self.assertListEqual(list(consignee_orders), [order_one, order_two])
        self.assertNotIn(order_three, consignee_orders)
