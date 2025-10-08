"""
Test settings for taps_backend project.
Extends development settings with test-specific overrides.
"""

from .development_settings import *  # noqa: F403, F401

# Use in-memory cache for tests (faster and doesn't require Redis)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
    }
}

# Flag to indicate we're in test mode (used to disable rate limiting)
TESTING = True
