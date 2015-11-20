import ast

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


from eums.models import Run, Flow, Runnable, RunQueue
from eums.services.flow_scheduler import schedule_run_for
from eums.services.response_alert_handler import ResponseAlertHandler


@api_view(['POST', ])
def save_answers(request):
    request = request.data
    runnable = Runnable.objects.get(pk=(request['runnable']))
    cancel_existing_runs_for(runnable)

    run = Run.objects.create(runnable=runnable, status=Run.STATUS.completed,
                             phone=runnable.contact.phone, scheduled_message_task_id='Web')

    flow = _get_flow(runnable)
    rapid_pro_formatted_answers = _process_answers(request['answers'], flow, run)
    _create_alert(run.runnable, rapid_pro_formatted_answers)
    runnable.confirm()
    _dequeue_next_run_for(runnable)

    return Response(status=status.HTTP_201_CREATED)


def _dequeue_next_run_for(runnable):
    next_run = RunQueue.dequeue(contact_person_id=runnable.contact_person_id)
    if next_run:
        schedule_run_for(next_run.runnable)
        next_run.update_status(RunQueue.STATUS.started)


def _process_answers(raw_answers, flow, run):
    rapid_pro_formatted_answers = []
    for answer in raw_answers:
        question = flow.question_with(label=answer['question_label'])
        params = {'values': [u'[{"category": {"eng":"%s", "base": "%s"}, "label": "%s"}]' %
                             (answer['value'], answer['value'], answer['question_label'])],
                  'text': answer['value']}
        question.create_answer(params, run)
        params_values = ast.literal_eval(params['values'][0])
        rapid_pro_formatted_answers.append(params_values[0])
    return rapid_pro_formatted_answers


def _create_alert(runnable, params):
    handler = ResponseAlertHandler(runnable, params)
    handler.process()


def _get_flow(runnable):
    flow_type = Runnable.WEB if getattr(runnable, 'item', None) else Runnable.IMPLEMENTING_PARTNER
    return Flow.objects.get(for_runnable_type=flow_type)


def cancel_existing_runs_for(delivery):
    Run.objects.filter(runnable=delivery).update(status=Run.STATUS.cancelled)
