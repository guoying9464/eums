from django.db import models

from eums.models import Runnable
from eums.models.programme import Programme


class DistributionPlan(Runnable):
    programme = models.ForeignKey(Programme)
    date = models.DateField(auto_now=True)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s, %s" % (self.programme.name, str(self.date))

    def sender_name(self):
        return "UNICEF"

    def get_description(self):
        return "delivery"

    def total_value(self):
        return reduce(lambda total, node: total + node.item.unit_value() * node.targeted_quantity,
                      self.distributionplannode_set.filter(parent__isnull=True), 0)
