"""
Production settings for taps_backend project.
Extends the base settings and overrides values specific to production environment.
"""

from .settings import *  # Import all base settings
import os

print("IN PRODUCTION SETTINGS")

# Override base settings for production

# Construct DATABASE_URL from individual components
if all(key in os.environ for key in ['DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_NAME', 'DATABASE_USER']):
    DATABASE_URL = f"postgres://{os.environ['DATABASE_USER']}:{os.environ.get('DATABASE_PASSWORD', '')}@{os.environ['DATABASE_HOST']}:{os.environ['DATABASE_PORT']}/{os.environ['DATABASE_NAME']}"
    os.environ['DATABASE_URL'] = DATABASE_URL

# Security settings
DEBUG = False
TEMPLATE_DEBUG = False

# TODO set these based on staging vs. prod
# Allow the domain where the app will be hosted
ALLOWED_HOSTS = [
    'api.taps.dillonkerr.com',
    'api.staging.taps.dillonkerr.com',  # Staging API domain
]

print("ALLOWED_HOSTS set to:")
print(ALLOWED_HOSTS)

print("VPC CIDR:")
print(os.environ.get('VPC_CIDR', 'Not Set'))

# Configure CIDR ranges for ALLOWED_HOSTS
# ALLOWED_CIDR_NETS = []
# if 'VPC_CIDR' in os.environ:
#     ALLOWED_CIDR_NETS = [os.environ['VPC_CIDR']]

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    'https://taps.dillonkerr.com',
    'https://taps-staging.dillonkerr.com',  # Staging frontend custom domain
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
