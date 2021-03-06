import json

from dateutil.parser import parse
from django.conf import settings
from django.db.models import Q

from eums.models import ReleaseOrderItem, NumericAnswer, TextAnswer, \
    MultipleChoiceAnswer, Flow, TextQuestion, Runnable, Run

ES_SETTINGS = settings.ELASTIC_SEARCH


def serialise_nodes(nodes):
    return map(lambda node: _serialise_node(node), nodes)


def _extract_clean_fields(obj):
    if obj is None:
        return {}
    obj_json = obj.__dict__.copy()
    bad_keys = filter(lambda key: key.startswith('_'), obj_json.keys())
    [obj_json.pop(bad_key) for bad_key in bad_keys]
    return obj_json


def _serialise_consignee(consignee):
    return _extract_clean_fields(consignee)


def _serialise_programme(programme):
    return _extract_clean_fields(programme)


def _serialise_release_order(release_order):
    ro_json = _extract_clean_fields(release_order)
    ro_json['release_order_number'] = release_order.order_number
    ro_json['order_number'] = release_order.waybill
    ro_json['sales_order'] = serialise_sales_order(release_order.sales_order)
    ro_json['purchase_order'] = serialise_sales_order(release_order.purchase_order)
    ro_json['order_type'] = 'release_order'
    return ro_json


def _serialise_purchase_order(purchase_order):
    po_json = _extract_clean_fields(purchase_order)
    po_json['sales_order'] = serialise_sales_order(purchase_order.sales_order)
    po_json['order_type'] = 'purchase_order'
    return po_json


def _serialise_item(item):
    item_json = _extract_clean_fields(item)
    item_json['unit'] = item.unit.name if item.unit else 'null'
    return item_json


def serialise_sales_order(sales_order):
    return _extract_clean_fields(sales_order)


def _serialise_release_order_item(item):
    ro_item_json = _extract_clean_fields(item)
    ro_item_json['order'] = _serialise_release_order(item.release_order)
    ro_item_json['item'] = _serialise_item(item.item)
    return ro_item_json


def _serialise_purchase_order_item(item):
    po_item_json = _extract_clean_fields(item)
    po_item_json['order'] = _serialise_purchase_order(item.purchase_order)
    po_item_json['item'] = _serialise_item(item.item)
    return po_item_json


def _serialise_order_item(order_item):
    if isinstance(order_item, ReleaseOrderItem):
        return _serialise_release_order_item(order_item)
    return _serialise_purchase_order_item(order_item)


def _serialise_node(node):
    node_json = _extract_clean_fields(node)
    node_json['consignee'] = _serialise_consignee(node.consignee)
    node_json['programme'] = _serialise_programme(node.programme)
    node_json['order_item'] = _serialise_order_item(node.item)

    responses = _serialise_node_responses(node)
    node_json['responses'] = responses
    node_json['value_lost'] = _compute_node_loss(node, responses)
    node_json['delivery_delay'] = _compute_delivery_delay(node, responses)
    node_json['is_directly_under_ip'] = _determine_extra_positioning_info(node)

    if node.ip:
        node_json['ip'] = _serialise_consignee(node.ip)
    if node.distribution_plan:
        node_json['delivery'] = _extract_clean_fields(node.distribution_plan)

    return node_json


def _compute_node_loss(node, responses):
    amount_received_responses = filter(lambda response: response['question']['label'] == 'amountReceived', responses)
    amount_received = int(amount_received_responses[0]['value']) if amount_received_responses else None
    value_received = node.item.unit_value() * amount_received if amount_received else None
    return round(node.total_value - value_received, 2) if value_received else None


def _compute_delivery_delay(node, responses):
    date_received_responses = filter(lambda response: response['question']['label'] == 'dateOfReceipt', responses)
    date_received_string = date_received_responses[0]['value'] if date_received_responses else None
    date_received = parse(date_received_string).date() if date_received_string else None
    return (date_received - node.delivery_date).days if date_received else None


def _determine_extra_positioning_info(node):
    parents = node.get_parents()
    return False if not parents else parents.first().tree_position == Flow.Label.IMPLEMENTING_PARTNER


def _serialise_node_responses(node):
    numeric_answers = NumericAnswer.objects.filter(run__runnable=node)
    text_answers = TextAnswer.objects.filter(run__runnable=node)
    multiple_choice_answers = MultipleChoiceAnswer.objects.filter(run__runnable=node)
    serialised_simple = map(lambda answer: _serialise_simple_answer(answer), list(numeric_answers) + list(text_answers))
    serialised_multiple = map(lambda answer: _serialise_multiple_choice_answer(answer), multiple_choice_answers)
    return serialised_simple + serialised_multiple + _get_relevant_delivery_responses_for(node)


def _get_relevant_delivery_responses_for(node):
    ip_flow = Flow.objects.get(label=Flow.Label.IMPLEMENTING_PARTNER)
    qn_date_of_receipt = TextQuestion.objects.get(flow__label=ip_flow, label='dateOfReceipt')
    delivery = node.distribution_plan
    date_received_answer = TextAnswer.objects \
        .filter(run__runnable=delivery, question=qn_date_of_receipt) \
        .filter(Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)) \
        .last()

    return [_serialise_simple_answer(date_received_answer)] if date_received_answer else []


def _serialise_simple_answer(answer):
    answer_json = _extract_clean_fields(answer)
    answer_json['value'] = unicode(answer_json['value'])
    answer_json['question'] = _serialise_question(answer.question)
    answer_json['run'] = _serialise_run(answer.run)
    return answer_json


def _serialise_multiple_choice_answer(answer):
    answer_json = _extract_clean_fields(answer)
    answer_json['run'] = _serialise_run(answer.run)
    answer_json['question'] = _serialise_question(answer.question)
    answer_json['value'] = answer.value.text
    return answer_json


def _serialise_question(question):
    return _extract_clean_fields(question)


def _serialise_run(run):
    return _extract_clean_fields(run)


def _serialise_datetime(datetime):
    return str(datetime)


def convert_to_bulk_api_format(nodes_to_update, nodes_to_delete):
    json_string = ''
    for node in nodes_to_update:
        json_string += '{"index": {"_index": \"%s\", "_type": \"%s\", "_id": %d}}\n' % _get_action_params(node['id'])
        json_string += json.dumps(node, default=_serialise_datetime)
        json_string += '\n'
    for node_id in nodes_to_delete:
        json_string += '{"delete": {"_index": \"%s\", "_type": \"%s\", "_id": %d}}\n' % _get_action_params(node_id)
    return json_string


def _get_action_params(node_id):
    return ES_SETTINGS.INDEX, ES_SETTINGS.NODE_TYPE, node_id
