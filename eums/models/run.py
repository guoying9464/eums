import datetime
from django.db import models
from django.db.models import Q
from model_utils.fields import StatusField
from model_utils import Choices
from eums import settings
from eums.models.time_stamped_model import TimeStampedModel


class Run(TimeStampedModel):
    STATUS = Choices('not_started', 'scheduled', 'completed', 'expired', 'cancelled')
    scheduled_message_task_id = models.CharField(max_length=255)
    runnable = models.ForeignKey('Runnable')
    status = StatusField()
    phone = models.CharField(max_length=255, null=True)

    class Meta:
        app_label = 'eums'

    def answers(self):
        numeric_answers = self.numericanswer_set.all()
        text_answers = self.textanswer_set.all()
        multiple_choice_answers = self.multiplechoiceanswer_set.all()
        return list(numeric_answers) + list(text_answers) + list(multiple_choice_answers)

    def last_answer(self):
        answers = self.answers()
        if len(answers) > 0:
            answers = sorted(answers, key=lambda answer: answer.modified, reverse=True)
            return answers[0]
        return None

    def questions_and_responses(self):
        answers = self.answers()
        return reduce(self._merge, answers, {})

    @staticmethod
    def _merge(answer_collection, answer):
        value = answer.value if type(answer.value) is long else unicode(answer.value)
        answer_collection[str(answer.question.label)] = value
        return answer_collection

    def __unicode__(self):
        return "%s - Phone: %s Status %s" % (self.runnable, self.phone, self.status)

    @classmethod
    def overdue_runs(cls):
        delivery_status_check_delay = datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
        max_allowed_reply_period = datetime.timedelta(days=settings.MAX_ALLOWED_REPLY_PERIOD)

        today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
        latest_allowed_date = today - delivery_status_check_delay - max_allowed_reply_period

        return Run.objects.filter(Q(status=Run.STATUS.scheduled) &
                                  Q(runnable__delivery_date__lt=latest_allowed_date))

    @classmethod
    def has_scheduled_run(cls, contact_person_id):
        scheduled_runs = Run.objects.filter((Q(status=Run.STATUS.scheduled) | Q(status=Run.STATUS.not_started)) &
                                            Q(runnable__contact_person_id=contact_person_id))
        return len(scheduled_runs) > 0

    @classmethod
    def last_temp_completed_run(cls, contact_person_id):
        completed_runs = Run.objects.filter(Q(status=Run.STATUS.completed) &
                                            Q(runnable__contact_person_id=contact_person_id)).order_by("-id")
        return completed_runs.first()

    def update_status(self, status):
        self.status = status
        self.save()
