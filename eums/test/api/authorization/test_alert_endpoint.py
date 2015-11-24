from eums.models import Runnable
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.api.authorization.permissions_test_case import PermissionsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.flow_factory import FlowFactory

ENDPOINT_URL = BACKEND_URL + 'alert/'


class AlertEndpointTest(AuthenticatedAPITestCase):

    def setUp(self):
        FlowFactory(rapid_pro_id=12345, for_runnable_type=Runnable.IMPLEMENTING_PARTNER)
        FlowFactory(rapid_pro_id=1234, for_runnable_type=Runnable.END_USER)
        FlowFactory(rapid_pro_id=1236, for_runnable_type=Runnable.MIDDLE_MAN)
        super(AlertEndpointTest, self).setUp()

    def test_admin_should_view_alert(self):
        AlertFactory()
        AlertFactory()
        AlertFactory()

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)

    def test_consignee_should_not_view_alert(self):
        AlertFactory()
        AlertFactory()
        AlertFactory()

        self.logout()
        self.log_consignee_in(ConsigneeFactory())

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 401)

    def test_admin_should_update_alert(self):
        PermissionsTestCase.setUpClass()
        alert = AlertFactory()

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, alert.id), data={'remarks': 'hello world'})

        self.assertEqual(response.status_code, 200)

    def test_consignee_should_not_update_alert(self):
        PermissionsTestCase.setUpClass()
        AlertFactory()

        self.logout()
        self.log_consignee_in(ConsigneeFactory())

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, 'someId'), data={'id': 'someId', 'remarks': 'hello world'})

        self.assertEqual(response.status_code, 401)

    def test_unicef_viewer_should_not_update_alert(self):
        PermissionsTestCase.setUpClass()
        AlertFactory()

        self.logout()
        self.log_unicef_viewer_in()

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, 'someId'), data={'id': 'someId', 'remarks': 'hello world'})

        self.assertEqual(response.status_code, 401)
