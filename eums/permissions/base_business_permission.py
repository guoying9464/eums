import logging

from django.contrib.contenttypes.models import ContentType

from eums.auth import PermissionCode
from eums.exceptions import ForbiddenException
from rest_framework import permissions

logger = logging.getLogger(__name__)


def build_request_permissions(*models):
    request_permissions = {'GET': [], 'POST': [], 'PUT': [], 'DELETE': [], 'PATCH': []}
    for model in models:
        upper_model_name = model.upper()
        request_permissions['GET'].append(getattr(PermissionCode, 'CAN_VIEW_%s' % upper_model_name, None))
        request_permissions['POST'].append(getattr(PermissionCode, 'CAN_ADD_%s' % upper_model_name, None))
        request_permissions['PUT'].append(getattr(PermissionCode, 'CAN_CHANGE_%s' % upper_model_name, None))
        request_permissions['DELETE'].append(getattr(PermissionCode, 'CAN_DELETE_%s' % upper_model_name, None))
        request_permissions['PATCH'].append(getattr(PermissionCode, 'CAN_PATCH_%s' % upper_model_name, None))
    return request_permissions


def is_user_has_permission(user, permission):
    if user.is_superuser:
        return True
    app_label = ContentType.objects.filter(permission__codename=permission).first().app_label
    return user.has_perm('%s.%s' % (app_label, permission))


class BaseBusinessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not hasattr(self, 'request_permissions'):
            raise ForbiddenException('Permission denied!')

        user_permissions = self.request_permissions.get(request.method)
        for user_permission in user_permissions:
            if is_user_has_permission(request.user, user_permission):
                return True

        raise ForbiddenException('Permission denied!')
