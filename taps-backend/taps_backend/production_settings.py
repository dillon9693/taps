"""
Production settings for taps_backend project.
Extends the base settings and overrides values specific to production environment.
"""

import environ

from .settings import *  # noqa: F403

env = environ.Env()

# Security settings
DEBUG = False
TEMPLATE_DEBUG = False

# TODO set these based on staging vs. prod
# Allow the domain where the app will be hosted
ALLOWED_HOSTS = [
    "tapsapi.dillonkerr.com",
    "tapsapi-staging.dillonkerr.com",  # Staging API domain
    "localhost",  # For Dockerfile health check
    "taps-production.up.railway.app",  # Railway production domain
]

MIDDLEWARE = [
    "taps_backend.middleware.HealthCheckSSLMiddleware",
    "allow_cidr.middleware.AllowCIDRMiddleware",
] + MIDDLEWARE  # noqa: F405

# Configure CIDR ranges for ALLOWED_HOSTS
ALLOWED_CIDR_NETS = []

vpc_cidr = env.str("VPC_CIDR", default="")
if len(vpc_cidr) > 0:
    ALLOWED_CIDR_NETS.append(vpc_cidr)

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://taps.dillonkerr.com",
    "https://taps-staging.dillonkerr.com",  # Staging frontend custom domain
]
CORS_ALLOW_CREDENTIALS = True

# Security middleware settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Static and media files
# TODO set these based on staging vs. prod
STATIC_URL = "https://tapsapi.dillonkerr.com/static/"
MEDIA_URL = "https://tapsapi.dillonkerr.com/media/"

# Logging configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

DATABASES = {"default": env.db("DATABASE_URL")}  # noqa: F405

# Email backend for production (SMTP - configure when needed)
EMAIL_BACKEND = env.str(
    "EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = env.str("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env.str("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env.str("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = env.str("DEFAULT_FROM_EMAIL", default="noreply@taps.com")
