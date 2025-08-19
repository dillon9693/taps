"""
Production settings for taps_backend project.
Extends the base settings and overrides values specific to production environment.
"""

from .settings import *
import os
import environ

env = environ.Env()

# Construct database URL from individual components and override DATABASES setting
database_host = env.str('DATABASE_HOST', default='')
database_port = env.str('DATABASE_PORT', default='')
database_name = env.str('DATABASE_NAME', default='')
database_user = env.str('DATABASE_USER', default='')

if all([database_host, database_port, database_name, database_user]):
    database_password = env.str('DATABASE_PASSWORD', default='')
    database_url = f"postgres://{database_user}:{database_password}@{database_host}:{database_port}/{database_name}"
    # Override the DATABASES setting with the constructed URL
    DATABASES = {"default": env.db_url_config(database_url)}

# Security settings
DEBUG = False
TEMPLATE_DEBUG = False

# TODO set these based on staging vs. prod
# Allow the domain where the app will be hosted
ALLOWED_HOSTS = [
    'api.taps.dillonkerr.com',
    'api.staging.taps.dillonkerr.com',  # Staging API domain
    'localhost', # For Dockerfile health check
]

MIDDLEWARE = [
    'taps_backend.middleware.HealthCheckSSLMiddleware',
    'allow_cidr.middleware.AllowCIDRMiddleware',
] + MIDDLEWARE

# Configure CIDR ranges for ALLOWED_HOSTS
ALLOWED_CIDR_NETS = []

vpc_cidr = env.str('VPC_CIDR', default='')
if len(vpc_cidr) > 0:
    ALLOWED_CIDR_NETS.append(vpc_cidr)

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    'https://taps.dillonkerr.com',
    'https://taps-staging.dillonkerr.com',  # Staging frontend custom domain
    'http://localhost:3000', # Needed for health check
]
CORS_ALLOW_CREDENTIALS = True

# Security middleware settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Static and media files
# TODO set these based on staging vs. prod
STATIC_URL = 'https://api.taps.dillonkerr.com/static/'
MEDIA_URL = 'https://api.taps.dillonkerr.com/media/'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
