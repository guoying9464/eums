import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from eums.models import DistributionPlanNode


class ResponseSerializer(object):
    def __init__(self, consignee_id=None):
        self.consignee_id = consignee_id

    def add_product_received_field(self, responses):
        if 'productReceived' not in responses:
            responses['productReceived'] = 'No'
        return responses

    def add_product_satisfied_field(self, responses):
        if 'satisfiedWithProduct' not in responses:
            if responses['productReceived'].lower() == 'yes':
                responses['satisfiedWithProduct'] = 'No'
        return responses

    def get_all_nodes(self):
        all_nodes = DistributionPlanNode.objects.all()
        if self.consignee_id:
            all_nodes = DistributionPlanNode.objects.filter(consignee_id=self.consignee_id)
        return all_nodes

    def serialize_responses(self):
        all_nodes = self.get_all_nodes()
        result = []
        for node in all_nodes:
            node_responses = node.responses()
            programme = node.distribution_plan.programme
            formatted_run_responses = {'node': node.id,
                                       'ip': node.get_ip(),
                                       'programme': {'id': programme.id, 'name': programme.name},
                                       'consignee': {'id': node.consignee.id, 'name': node.consignee.name,
                                                     'type': node.tree_position}}
            for item_run, responses in node_responses.iteritems():
                formatted_run_responses.update({'item': item_run.node_line_item.item.description,
                                                'amountSent': item_run.node_line_item.targeted_quantity})
                for response in responses:
                    formatted_run_responses.update({response.question.label: response.format()})
                formatted_run_responses_with_product_received = self.add_product_received_field(formatted_run_responses)
                result.append(self.add_product_satisfied_field(formatted_run_responses_with_product_received))
        return result


class ConsigneeResponses(APIView):
    def get(self, request, consignee_id, *args, **kwargs):
        result = ResponseSerializer(consignee_id).serialize_responses()
        return Response(result, status=status.HTTP_200_OK)


class AllConsigneeResponses(APIView):
    def get(self, request, *args, **kwargs):
        result = ResponseSerializer().serialize_responses()
        return Response(result, status=status.HTTP_200_OK)