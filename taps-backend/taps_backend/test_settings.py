"""
Test settings for taps_backend project.
Extends the base settings and overrides values specific to test environment.
"""

from .settings import *  # noqa: F403

# Use SQLite for testing
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Disable debug mode in tests
DEBUG = False

# Use a simple password hasher for faster tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# Use console email backend for tests
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
