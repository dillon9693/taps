"""
Tests for rate limiting functionality.
"""

from unittest.mock import Mock

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import RequestFactory, TestCase

from taps.rate_limit import check_rate_limit, get_rate_for_user, get_rate_limit_key


class RateLimitUtilsTest(TestCase):
    """Test rate limiting utility functions."""

    def setUp(self):
        """Set up test fixtures."""
        from django.conf import settings

        # Enable rate limiting for these tests
        self._original_testing = settings.TESTING
        settings.TESTING = False

        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass"
        )
        cache.clear()

    def tearDown(self):
        """Clean up after tests."""
        from django.conf import settings

        # Restore original TESTING flag
        settings.TESTING = self._original_testing
        cache.clear()

    def test_get_rate_limit_key_authenticated(self):
        """Test rate limit key generation for authenticated users."""
        request = self.factory.get("/")
        request.user = self.user

        key = get_rate_limit_key("test_group", request)
        self.assertEqual(key, f"user:{self.user.id}")

    def test_get_rate_limit_key_anonymous(self):
        """Test rate limit key generation for anonymous users."""
        request = self.factory.get("/")
        request.user = Mock(is_authenticated=False)

        key = get_rate_limit_key("test_group", request)
        self.assertTrue(key.startswith("ip:"))

    def test_get_rate_limit_key_anonymous_with_forwarded_for(self):
        """Test rate limit key uses X-Forwarded-For header when present."""
        request = self.factory.get(
            "/", HTTP_X_FORWARDED_FOR="203.0.113.1, 198.51.100.1"
        )
        request.user = Mock(is_authenticated=False)

        key = get_rate_limit_key("test_group", request)
        self.assertEqual(key, "ip:203.0.113.1")

    def test_get_rate_for_user_authenticated(self):
        """Test rate selection for authenticated user."""
        request = self.factory.get("/")
        request.user = self.user

        rate = get_rate_for_user(request, "5/15m", "100/15m")
        self.assertEqual(rate, "100/15m")

    def test_get_rate_for_user_anonymous(self):
        """Test rate selection for anonymous user."""
        request = self.factory.get("/")
        request.user = Mock(is_authenticated=False)

        rate = get_rate_for_user(request, "5/15m", "100/15m")
        self.assertEqual(rate, "5/15m")

    def test_check_rate_limit_allows_first_request(self):
        """Test that first request is allowed."""
        request = self.factory.get("/")
        request.user = self.user

        is_limited = check_rate_limit(request, "test_group", "5/15m")
        self.assertFalse(is_limited)

    def test_check_rate_limit_blocks_after_limit(self):
        """Test that requests are blocked after limit is exceeded."""
        request = self.factory.get("/")
        request.user = self.user

        # Make 5 requests (the limit)
        for _ in range(5):
            is_limited = check_rate_limit(request, "test_group", "5/15m")
            self.assertFalse(is_limited)

        # 6th request should be blocked
        is_limited = check_rate_limit(request, "test_group", "5/15m")
        self.assertTrue(is_limited)

    def test_check_rate_limit_different_groups(self):
        """Test that different groups have separate limits."""
        request = self.factory.get("/")
        request.user = self.user

        # Fill up limit for group1
        for _ in range(5):
            check_rate_limit(request, "group1", "5/15m")

        # group2 should still allow requests
        is_limited = check_rate_limit(request, "group2", "5/15m")
        self.assertFalse(is_limited)

    def test_check_rate_limit_different_users(self):
        """Test that different users have separate limits."""
        user1_request = self.factory.get("/")
        user1_request.user = self.user

        user2 = User.objects.create_user(
            username="testuser2", email="test2@example.com", password="testpass"
        )
        user2_request = self.factory.get("/")
        user2_request.user = user2

        # Fill up limit for user1
        for _ in range(5):
            check_rate_limit(user1_request, "test_group", "5/15m")

        # user2 should still allow requests
        is_limited = check_rate_limit(user2_request, "test_group", "5/15m")
        self.assertFalse(is_limited)

    def test_check_rate_limit_invalid_rate_format(self):
        """Test that invalid rate format doesn't block requests."""
        request = self.factory.get("/")
        request.user = self.user

        # Invalid rate format should log error and allow request
        is_limited = check_rate_limit(request, "test_group", "invalid")
        self.assertFalse(is_limited)

    def test_check_rate_limit_no_rate(self):
        """Test that None rate allows all requests."""
        request = self.factory.get("/")
        request.user = self.user

        is_limited = check_rate_limit(request, "test_group", None)
        self.assertFalse(is_limited)

    def test_check_rate_limit_parse_seconds(self):
        """Test rate limit with seconds period."""
        request = self.factory.get("/")
        request.user = self.user

        # 2 requests per second
        for _ in range(2):
            is_limited = check_rate_limit(request, "test_group", "2/1s")
            self.assertFalse(is_limited)

        # 3rd should be blocked
        is_limited = check_rate_limit(request, "test_group", "2/1s")
        self.assertTrue(is_limited)

    def test_check_rate_limit_parse_hours(self):
        """Test rate limit with hours period."""
        request = self.factory.get("/")
        request.user = self.user

        # Should allow request
        is_limited = check_rate_limit(request, "test_group", "100/1h")
        self.assertFalse(is_limited)

    def test_check_rate_limit_parse_days(self):
        """Test rate limit with days period."""
        request = self.factory.get("/")
        request.user = self.user

        # Should allow request
        is_limited = check_rate_limit(request, "test_group", "1000/1d")
        self.assertFalse(is_limited)
