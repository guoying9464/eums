from eums.client.test.functional.fixtures.mapdata_runs import *
from eums.client.test.functional.fixtures.mapdata_release_order_items import *
from eums.models import DistributionReport, Alert
from eums.models import NumericAnswer
from eums.models import TextAnswer
from eums.models import MultipleChoiceAnswer
from eums.fixtures.end_user_questions import *
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.run_factory import RunFactory


NumericAnswer.objects.create(run=run_7, question=eu_question_3, value=50)
NumericAnswer.objects.create(run=run_8, question=eu_question_3, value=10)
NumericAnswer.objects.create(run=run_9, question=eu_question_3, value=30)
NumericAnswer.objects.create(run=run_10, question=eu_question_3, value=20)
NumericAnswer.objects.create(run=run_11, question=eu_question_3, value=30)
NumericAnswer.objects.create(run=run_12, question=eu_question_3, value=10)
NumericAnswer.objects.create(run=run_12, question=eu_question_3, value=10)
NumericAnswer.objects.create(run=run_14, question=eu_question_3, value=20)
NumericAnswer.objects.create(run=run_16, question=eu_question_3, value=60)
NumericAnswer.objects.create(run=run_16, question=eu_question_3, value=20)
NumericAnswer.objects.create(run=run_17, question=eu_question_3, value=100)
NumericAnswer.objects.create(run=run_18, question=eu_question_3, value=1)
NumericAnswer.objects.create(run=run_20, question=eu_question_3, value=1)
NumericAnswer.objects.create(run=run_20, question=eu_question_3, value=1)
NumericAnswer.objects.create(run=run_22, question=eu_question_3, value=1)
NumericAnswer.objects.create(run=run_23, question=eu_question_3, value=1)

TextAnswer.objects.create(run=run_7, question=eu_question_2, value='6/10/2014')
TextAnswer.objects.create(run=run_7, question=eu_question_7, value='didnt not specify')
TextAnswer.objects.create(run=run_7, question=eu_question_8, value='they were damaged')

MultipleChoiceAnswer.objects.create(run=run_7, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_7, question=eu_question_4, value=eu_q4_option_damaged)
MultipleChoiceAnswer.objects.create(run=run_7, question=eu_question_5, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_7, question=eu_question_6, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_8, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_7, question=eu_question_4, value=eu_q4_option_good)
MultipleChoiceAnswer.objects.create(run=run_7, question=eu_question_5, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_9, question=eu_question_1, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_9, question=eu_question_6, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_10, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_10, question=eu_question_4, value=eu_q4_option_expired)
MultipleChoiceAnswer.objects.create(run=run_10, question=eu_question_5, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_11, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_11, question=eu_question_4, value=eu_q4_option_damaged)
MultipleChoiceAnswer.objects.create(run=run_11, question=eu_question_5, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_12, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_12, question=eu_question_4, value=eu_q4_option_good)
MultipleChoiceAnswer.objects.create(run=run_12, question=eu_question_5, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_13, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_13, question=eu_question_4, value=eu_q4_option_good)
MultipleChoiceAnswer.objects.create(run=run_13, question=eu_question_5, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_14, question=eu_question_1, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_14, question=eu_question_6, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_15, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_15, question=eu_question_4, value=eu_q4_option_good)
MultipleChoiceAnswer.objects.create(run=run_15, question=eu_question_5, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_16, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_16, question=eu_question_5, value=eu_q5_option_yes)
MultipleChoiceAnswer.objects.create(run=run_17, question=eu_question_1, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_17, question=eu_question_6, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_18, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_17, question=eu_question_4, value=eu_q4_option_damaged)
MultipleChoiceAnswer.objects.create(run=run_18, question=eu_question_5, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_19, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_19, question=eu_question_4, value=eu_q4_option_good)
MultipleChoiceAnswer.objects.create(run=run_19, question=eu_question_5, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_20, question=eu_question_1, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_20, question=eu_question_6, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_21, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_21, question=eu_question_4, value=eu_q4_option_damaged)
MultipleChoiceAnswer.objects.create(run=run_21, question=eu_question_5, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_22, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_22, question=eu_question_4, value=eu_q4_option_damaged)
MultipleChoiceAnswer.objects.create(run=run_22, question=eu_question_5, value=eu_q5_option_no)
MultipleChoiceAnswer.objects.create(run=run_23, question=eu_question_1, value=eu_q1_option_1)
MultipleChoiceAnswer.objects.create(run=run_23, question=eu_question_4, value=eu_q4_option_damaged)
MultipleChoiceAnswer.objects.create(run=run_23, question=eu_question_5, value=eu_q5_option_no)

DistributionReport.objects.create(total_distributed=80, total_not_received=67, consignee=consignee_32,
                                  total_received=100, programme=programme_3)

# WEB RUNS
web_flow = Flow.objects.get(for_runnable_type='WEB')
was_item_received = MultipleChoiceQuestion.objects.get(flow=web_flow, label='itemReceived')
yes = Option.objects.get(question=was_item_received, text='Yes')

wakiso = Consignee.objects.get(name='WAKISO DHO')
plan = DeliveryFactory()
wakiso_node_1 = DeliveryNodeFactory(consignee=wakiso, item=po_item_1, quantity=100, distribution_plan=plan)
wakiso_node_2 = DeliveryNodeFactory(consignee=wakiso, item=po_item_2, quantity=60, distribution_plan=plan)
wakiso_node_3 = DeliveryNodeFactory(consignee=wakiso, item=po_item_3, quantity=300, distribution_plan=plan)

MultipleChoiceAnswerFactory(question=was_item_received, value=yes, run=RunFactory(runnable=wakiso_node_1))
MultipleChoiceAnswerFactory(question=was_item_received, value=yes, run=RunFactory(runnable=wakiso_node_2))
MultipleChoiceAnswerFactory(question=was_item_received, value=yes, run=RunFactory(runnable=wakiso_node_3))

# item deliveries made by wakiso
DeliveryNodeFactory(parents=[(wakiso_node_1, 60)], tree_position="END_USER", item=po_item_1, distribution_plan=plan)
DeliveryNodeFactory(parents=[(wakiso_node_1, 40)], tree_position="MIDDLE_MAN", item=po_item_1, distribution_plan=plan)
DeliveryNodeFactory(parents=[(wakiso_node_2, 58)], tree_position="END_USER", item=po_item_2, distribution_plan=plan)

# alerts
AlertFactory(order_type=Alert.ORDER_TYPES.waybill, order_number=123456, issue=Alert.ISSUE_TYPES.not_received,
             consignee_name='Some Consignee Name', contact_name='Some Contact Name')
AlertFactory(order_type=Alert.ORDER_TYPES.purchase_order, order_number=654321, issue=Alert.ISSUE_TYPES.bad_condition)
