"""
Development settings for taps_backend project.
Extends the base settings and overrides values specific to development environment.
"""

from .settings import *  # Import all base settings

# Security settings
DEBUG = True
TEMPLATE_DEBUG = True

# Allow the domain where the app will be hosted
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
]

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # For local development
]
CORS_ALLOW_CREDENTIALS = True

# Disable security middleware settings for local development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
SECURE_PROXY_SSL_HEADER = None

# Static and media files
STATIC_URL = '/static/'
MEDIA_URL = '/media/'

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
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

DATABASES = {"default": env.db("DATABASE_URL")}
