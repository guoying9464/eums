from eums.models import MultipleChoiceQuestion, Option, TextQuestion, Flow, Runnable, Question


def seed_ip_questions():
    ip_flow, _ = Flow.objects.get_or_create(label=Flow.Label.IMPLEMENTING_PARTNER)

    ip_question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
        text='Was delivery received?', label=Question.LABEL.deliveryReceived, flow=ip_flow, position=1)
    ip_yes, _ = Option.objects.get_or_create(text='Yes', question=ip_question_1)
    ip_no, _ = Option.objects.get_or_create(text='No', question=ip_question_1)
    ip_flow.end_nodes = []
    ip_flow.end_nodes.append([ip_question_1.id, ip_no.id])
    ip_flow.save()

    ip_question_2, _ = TextQuestion.objects.get_or_create(
        text='When was delivery received?', label='dateOfReceipt', flow=ip_flow, position=2)

    ip_question_3, _ = MultipleChoiceQuestion.objects.get_or_create(
        text='Was delivery in good condition?', label=Question.LABEL.isDeliveryInGoodOrder,
        flow=ip_flow, position=3)
    in_good_condition_yes, _ = Option.objects.get_or_create(text='Yes', question=ip_question_3)
    in_good_condition_no, _ = Option.objects.get_or_create(text='No', question=ip_question_3)

    ip_question_4, _ = MultipleChoiceQuestion.objects.get_or_create(
        text="Are you satisfied with the delivery?",
        label="satisfiedWithDelivery",
        flow=ip_flow, position=4)
    satisfied, _ = Option.objects.get_or_create(text="Yes", question=ip_question_4)
    not_satisfied, _ = Option.objects.get_or_create(text="No", question=ip_question_4)

    ip_question_5, _ = TextQuestion.objects.get_or_create(
        text='Additional Remarks', label='additionalDeliveryComments', flow=ip_flow, position=5)
    ip_flow.end_nodes.append([ip_question_5.id, Flow.NO_OPTION])
    ip_flow.save()

    questions = {
        'WAS_DELIVERY_RECEIVED': ip_question_1,
        'DATE_OF_RECEIPT': ip_question_2,
        'IS_DELIVERY_IN_GOOD_ORDER': ip_question_3,
        'SATISFIED_WITH_DELIVERY': ip_question_4,
        'ADDITIONAL_DELIVERY_COMMENTS': ip_question_5
    }

    options = {
        'DELIVERY_WAS_RECEIVED': ip_yes,
        'DELIVERY_WAS_NOT_RECEIVED': ip_no,
        'IN_GOOD_CONDITION': in_good_condition_yes,
        'NOT_IN_GOOD_CONDITION': in_good_condition_no,
        'SATISFIED': satisfied,
        'NOT_SATISFIED': not_satisfied
    }

    return questions, options, ip_flow


ip_questions, ip_options, ip_flow = seed_ip_questions()
