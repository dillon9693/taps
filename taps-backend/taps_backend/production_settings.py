"""
Production settings for taps_backend project.
Extends the base settings and overrides values specific to production environment.
"""

from .settings import *  # Import all base settings

# Override base settings for production

# Security settings
DEBUG = False
TEMPLATE_DEBUG = False

# Allow the domain where the app will be hosted
ALLOWED_HOSTS = [
    'api.taps.dillonkerr.com',
    '.execute-api.us-east-1.amazonaws.com',  # For AWS API Gateway
    'localhost',
    '127.0.0.1',
]

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    'https://taps.dillonkerr.com',
    'http://localhost:3000',  # For local development
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
STATIC_URL = 'https://taps.dillonkerr.com/static/'
MEDIA_URL = 'https://taps.dillonkerr.com/media/'

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
