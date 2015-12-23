from unittest import TestCase

from mock import patch

from eums import settings_export
from eums.settings_export import CSV_EXPIRED_HOURS
from eums.models import DistributionPlanNode, DistributionPlan
from eums.services.exporter.stock_report_csv_exporter import StockReportExporter


class StockReportExporterTest(TestCase):
    HOSTNAME = 'http://ha.ha/'

    def tearDown(self):
        DistributionPlan.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    @patch('eums.services.exporter.delivery_csv_exporter.AbstractCSVExporter.generate_exported_csv_file_name')
    def test_generate_stock_report_should_return_correct_notification_details(self,
                                                                              generate_exported_csv_file_name):
        file_name = 'stocks_report_1448892495779.csv'
        generate_exported_csv_file_name.return_value = file_name
        stock_report_csv_export = StockReportExporter(self.HOSTNAME)

        category = 'report/feedback'
        export_label = stock_report_csv_export.export_label

        details = (settings_export.EMAIL_COMMON_SUBJECT,
                   settings_export.EMAIL_NOTIFICATION_CONTENT.format(export_label,
                                                                     'http://ha.ha/static/exports/' + category +
                                                                     '/' + file_name, CSV_EXPIRED_HOURS))
        self.assertEqual(stock_report_csv_export.notification_details(), details)

    def test_assemble_csv_data(self):
        total_value_received = '$0.00'
        document_number = '2014111'
        last_received_date = ''
        total_value_dispensed = '$140'
        last_shipment_date = '2014-09-25'
        balance = '-140'
        programme = u'AAASpecial Programme'
        item = {
                'quantity_dispatched':  7,
                'code': u'Code 296',
                'quantity_delivered': 10,
                'description': u'Another Funny Item',
                'date_delivered': '2014-09-25',
                'date_confirmed': '',
                'balance': -7,
                'quantity_confirmed': 0,
                'consignee': u'Consignee 62',
                'location': u'Kampala'}
        stocks = [{'total_value_received': total_value_received,
                   'document_number': document_number,
                   'last_received_date': last_received_date,
                   'answtotal_value_dispenseders': total_value_dispensed,
                   'last_shipment_date': last_shipment_date,
                   'balance': balance,
                   'programme': programme,
                   'item': item}, ]


        csv_exporter = StockReportExporter(self.HOSTNAME)
        row_value = [
            document_number,
            programme,
            last_shipment_date,
            last_received_date,
            total_value_received,
            total_value_dispensed,
            balance,
            item.get('code'),
            item.get('description'),
            item.get('location'),
            item.get('consignee'),
            item.get('quantity_delivered'),
            item.get('date_delivered'),
            item.get('quantity_confirmed'),
            item.get('date_confirmed'),
            item.get('quantity_dispatched'),
            item.get('balance')
        ]
        assembled_data = csv_exporter.assemble_csv_data(stocks)
        header = csv_exporter.config_headers()
        expect_data = [header, row_value]
        print expect_data
        print '\n'
        print assembled_data
        # self.assertEqual(expect_data, assembled_data)
        # self.assertTrue(len(assembled_data) is 2)