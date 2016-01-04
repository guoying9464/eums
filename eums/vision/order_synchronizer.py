import datetime
import json
from abc import ABCMeta, abstractmethod

from eums.vision.vision_data_converter import convert_vision_value
from eums.vision.vision_data_synchronizer import VisionDataSynchronizer, VisionException


class OrderSynchronizer(VisionDataSynchronizer):
    __metaclass__ = ABCMeta

    def __init__(self, base_url, start_date='', end_date=''):
        if not start_date:
            raise VisionException(message="'start' date is required")

        end_date = end_date if end_date else datetime.date.today().strftime('%d%m%Y')
        super(OrderSynchronizer, self).__init__(self._get_url(base_url, start_date, end_date))

    @abstractmethod
    def _get_or_create_order(self, record):
        pass

    @abstractmethod
    def _update_or_create_item(self, record, order):
        pass

    def _get_json(self, data):
        # the data got from web service is a string of string
        return [] if data == self.NO_DATA_MESSAGE else json.loads(data)

    def _convert_records(self, records):
        def _convert_record(record):
            return {key: convert_vision_value(key, value) for key, value in record.iteritems()}
        return map(_convert_record, records)

    def _save_records(self, records):
        formatted_records = self._format_records(self._filter_records(records))
        for record in formatted_records:
            order = self._get_or_create_order(record)
            if order:
                for item in record['ITEMS']:
                    self._update_or_create_item(item, order)

    @staticmethod
    def _get_url(base_url, start_date, end_date):
        return base_url + start_date + '/' + end_date

    @staticmethod
    def _filter_records(records):
        return []

    @staticmethod
    def _format_records(records):
        return []

    @staticmethod
    def _is_all_digit(fields, key, record):
        if key in fields and not isinstance(record[key], int):
            return False
        return True

