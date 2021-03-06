import logging.config
import os
from collections import namedtuple

import psycopg2.extensions
import raven
from os.path import join, exists

from datetime import datetime

from eums.process_listener import SENTRY_DSN, GIT_SHA

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'invalid_secret_key')

# SECURITY WARNING: don't run withe debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = [os.getenv('DJANGO_ALLOWED_HOST', 'invalid_allowed_host')]

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'eums',
    'rest_framework',
    'password_reset',
    'django_extensions',
    'test_without_migrations',
    'raven.contrib.django.raven_compat'
)

MIDDLEWARE_CLASSES = (
    'raven.contrib.django.raven_compat.middleware.Sentry404CatchMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'eums',
        'USER': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
        'OPTIONS': {
            'isolation_level': psycopg2.extensions.ISOLATION_LEVEL_SERIALIZABLE,
        },
    }
}

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_FILTER_BACKENDS': ('rest_framework.filters.DjangoFilterBackend', 'rest_framework.filters.SearchFilter')
}

RAVEN_CONFIG = {
    'dsn': SENTRY_DSN,
    'release': GIT_SHA,
    'transport': 'raven.transport.http.HTTPTransport'
}

MEDIA_ROOT = os.path.join(BASE_DIR, 'eums/uploads')

MEDIA_URL = '/media/'

ROOT_URLCONF = 'eums.urls'

CSRF_FAILURE_VIEW = 'eums.views.csrf.csrf_failure'

WSGI_APPLICATION = 'eums.wsgi.application'

LANGUAGE_CODE = 'en-gb'

TIME_ZONE = os.getenv('TIME_ZONE', 'Africa/Kampala')

USE_I18N = True

USE_L10N = True

TEMPLATE_DIRS = (os.path.join(BASE_DIR, 'eums/templates'),)

FILE_UPLOAD_MAX_MEMORY_SIZE = 26214400

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

STATICFILES_DIRS = (os.path.join(BASE_DIR, 'eums/client'),)

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# Number of days after expected delivery date after which messages to consignees are sent out
DELIVERY_STATUS_CHECK_DELAY = 7

# Expiry time (days) for a scheduled flow ** This should match the one set in rapid pro! and has a max value of 30 days
MAX_ALLOWED_REPLY_PERIOD = 1

# Buffer time in case run is scheduled for immediate delivery (due to node not being saved immediately on delivery)
DELIVERY_BUFFER_IN_SECONDS = 10
TEMP_DELIVERY_BUFFER_IN_SECONDS = 1800

# Contacts service settings
CONTACTS_SERVICE_URL = 'http://localhost:8005/api/contacts/'

# RapidPro settings
RAPIDPRO_API_TOKEN = os.getenv('RAPIDPRO_API_TOKEN', 'invalid_token_if_no_token')
RAPIDPRO_URL = 'https://app.rapidpro.io/api/v2/'
RAPIDPRO_URLS = {
    'FLOWS': "%sflows.json" % RAPIDPRO_URL,
    'RUNS': "%sflow_starts.json" % RAPIDPRO_URL,
    'CONTACTS': "%scontacts.json" % RAPIDPRO_URL,
    'GROUPS': "%sgroups.json" % RAPIDPRO_URL
}
RAPIDPRO_EXTRAS = {'CONTACT_NAME': 'contactName', 'SENDER': 'sender', 'PRODUCT': 'product'}

# WARNING: Never turn this on unless it is a live instance of the app (Staging or Prod. Not Dev, Test, or QA).
RAPIDPRO_LIVE = False
RAPIDPRO_SSL_VERIFY = True

CELERY_LIVE = False

VISION_USER = os.getenv('VISION_USER', 'invalid_vision_user')
VISION_PASSWORD = os.getenv('VISION_PASSWORD', 'invalid_vision_password')
VISION_URL = 'https://devapis.unicef.org/BIService/BIWebService.svc/'
VISION_BUSINESS_AREA_CODE = os.getenv('VISION_BUSINESS_AREA_CODE', 'invalid_code')
VISION_COUNTRY_CODE = os.getenv('VISION_COUNTRY_CODE', 'invalid_code')

NON_RESPONSE_GRACE_PERIOD = DELIVERY_STATUS_CHECK_DELAY  # in days

NON_RESPONSE_PERCENTAGE_THRESHOLD = 70

LOGIN_REDIRECT_URL = "/"

LOGIN_URL = "/login"

_es_settings = namedtuple('ES_SETTINGS', ['INDEX', 'NODE_TYPE', 'HOST', 'MAPPING', 'NODE_SEARCH', 'BULK'])
_base_url = 'http://localhost:9200/'
ELASTIC_SEARCH = _es_settings(
    'eums',
    'delivery_node',
    _base_url,
    '%s/_mapping' % _base_url,
    '%s/delivery_node/_search' % _base_url,
    '%s/_bulk' % _base_url,
)

# EMAIL_BACKEND = 'django_mailgun.MailgunBackend'
# MAILGUN_ACCESS_KEY = os.getenv('MAILGUN_ACCESS_KEY', '')
# MAILGUN_SERVER_NAME = 'sandbox6c2b4eb4198643d5be6e7d696f7309ae.mailgun.org'
# MAILGUN_SENDER = "UNICEF EUM <postmaster@sandbox6c2b4eb4198643d5be6e7d696f7309ae.mailgun.org>"
#
# HOSTNAME = 'eums.unicefuganda.org'

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'do.not.reply.eums@gmail.com'
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_PASSWORD', 'invalid_if_no_email')
EMAIL_USE_TLS = True
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

DEFAULT_FROM_EMAIL = 'do.not.reply.eums@gmail.com'

# Logging configuration
LOGGING_DIR = join(BASE_DIR, 'logs/')

LOG_SUFFIX = datetime.today().strftime('%Y%m%d')
os.mkdir(LOGGING_DIR) if not exists(LOGGING_DIR) else None

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'standard': {
            'format': "[%(asctime)s] %(levelname)s [%(filename)s : %(funcName)s():%(lineno)s] %(message)s",
            'datefmt': "%Y-%m-%d %H:%M:%S"
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'null': {
            'level': 'INFO',
            'class': 'django.utils.log.NullHandler'
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'debug': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGGING_DIR + "/debug.%s.log" % LOG_SUFFIX,
            'maxBytes': 1024 * 1024 * 5,
            'backupCount': 10,
            'formatter': 'standard'
        },
        'request': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGGING_DIR + '/django_request.%s.log' % LOG_SUFFIX,
            'maxBytes': 1024 * 1024 * 5,
            'backupCount': 30,
            'formatter': 'standard'
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'standard'
        },
        'sentry': {
            'level': 'ERROR',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
            'tags': {'UNICEF': 'EUMS'},
        }
    },
    'loggers': {
        '': {  # root logger
            'handlers': ['console', 'debug', 'sentry'],
            'level': 'DEBUG'
        },
        'django.request': {
            'handlers': ['request'],
            'level': 'ERROR',
            'propagate': True
        },
        'celery.task': {
            'handlers': ['console', 'debug', 'sentry'],
            'level': 'DEBUG',
            'propagate': False
        },
        'celery.work': {
            'handlers': ['console', 'debug', 'sentry'],
            'level': 'DEBUG',
            'propagate': False
        }
    }
}

CELERYD_HIJACK_ROOT_LOGGER = False
LOGGING_CONFIG = None
logging.config.dictConfig(LOGGING)
