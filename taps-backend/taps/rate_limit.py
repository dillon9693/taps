"""
Rate limiting utilities for the Taps GraphQL API.

This module provides rate limiting functionality using django-ratelimit
to protect the API from abuse and excessive resource consumption.
"""

import logging
from functools import wraps

from django.core.cache import cache
from django_ratelimit.exceptions import Ratelimited
from graphql import GraphQLError

logger = logging.getLogger(__name__)


# Rate limit configurations
# Format: "count/period" where period can be s, m, h, d
RATE_LIMITS = {
    "anon_query": "100/15m",
    "anon_mutation": "20/15m",
    "anon_auth": "5/15m",
    "auth_query": "500/15m",
    "auth_mutation": "100/15m",
}


def get_rate_limit_key(group, request):
    """
    Generate a rate limit key based on user authentication status.

    For authenticated users, use user ID.
    For anonymous users, use IP address.
    """
    if request.user.is_authenticated:
        return f"user:{request.user.id}"
    # Use X-Forwarded-For if behind a proxy, otherwise use REMOTE_ADDR
    ip = request.META.get("HTTP_X_FORWARDED_FOR")
    if ip:
        # X-Forwarded-For can contain multiple IPs, take the first one
        ip = ip.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    return f"ip:{ip}"


def get_rate_for_user(request, anon_rate, auth_rate):
    """
    Return appropriate rate limit based on user authentication status.
    """
    return auth_rate if request.user.is_authenticated else anon_rate


def graphql_ratelimit(anon_rate=None, auth_rate=None, group=None):
    """
    Decorator to apply rate limiting to GraphQL resolvers.

    Args:
        anon_rate: Rate limit for anonymous users (e.g., "5/15m")
        auth_rate: Rate limit for authenticated users (e.g., "100/15m")
        group: Optional group name for the rate limit (defaults to resolver name)

    Usage:
        @graphql_ratelimit(anon_rate="5/15m", auth_rate="20/15m")
        def mutate(self, info, ...):
            ...
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Extract info context from args
            # For mutations: mutate(self, info, ...)
            # For queries: resolve_x(self, info, ...)
            info = None
            for arg in args:
                if hasattr(arg, "context"):
                    info = arg
                    break

            if info is None:
                logger.warning(
                    f"Could not find info context in {func.__name__}, "
                    "skipping rate limit"
                )
                return func(*args, **kwargs)

            request = info.context
            rate = get_rate_for_user(request, anon_rate, auth_rate)
            limit_group = group or f"graphql:{func.__name__}"

            # Apply rate limiting
            try:
                is_limited = check_rate_limit(
                    request=request,
                    group=limit_group,
                    rate=rate,
                )

                if is_limited:
                    user_id = (
                        request.user.id if request.user.is_authenticated else "anon"
                    )
                    logger.warning(
                        f"Rate limit exceeded for {limit_group}: user={user_id}"
                    )
                    raise GraphQLError(
                        "Rate limit exceeded. Please try again later.",
                        extensions={
                            "code": "RATE_LIMIT_EXCEEDED",
                            "rate": rate,
                        },
                    )

                return func(*args, **kwargs)
            except Ratelimited:
                user_id = request.user.id if request.user.is_authenticated else "anon"
                logger.warning(f"Rate limit exceeded for {limit_group}: user={user_id}")
                raise GraphQLError(
                    "Rate limit exceeded. Please try again later.",
                    extensions={
                        "code": "RATE_LIMIT_EXCEEDED",
                        "rate": rate,
                    },
                )

        return wrapper

    return decorator


def check_rate_limit(request, group, rate):
    """
    Check if a request should be rate limited.

    Args:
        request: Django request object
        group: Rate limit group name
        rate: Rate limit string (e.g., "5/15m")

    Returns:
        True if the request should be blocked (rate limit exceeded), False otherwise.
    """
    # Skip rate limiting during tests
    from django.conf import settings

    if settings.TESTING:
        return False

    if not rate:
        return False

    # Parse rate (e.g., "5/15m" -> count=5, period=900 seconds)
    try:
        count, period = rate.split("/")
        count = int(count)

        # Convert period to seconds
        period_value = int(period[:-1])
        period_unit = period[-1]

        period_seconds = {
            "s": 1,
            "m": 60,
            "h": 3600,
            "d": 86400,
        }.get(period_unit, 60)

        period_seconds *= period_value
    except (ValueError, KeyError):
        logger.error(f"Invalid rate format: {rate}")
        return False

    # Generate cache key
    key_suffix = get_rate_limit_key(group, request)
    cache_key = f"ratelimit:{group}:{key_suffix}"

    # Get current count from cache
    current = cache.get(cache_key, 0)

    # Check if limit exceeded
    if current >= count:
        return True

    # Increment counter
    try:
        # Try to increment atomically if possible
        if hasattr(cache, "incr"):
            try:
                cache.incr(cache_key)
            except ValueError:
                # Key doesn't exist, set it
                cache.set(cache_key, 1, period_seconds)
        else:
            # Fallback to set
            cache.set(cache_key, current + 1, period_seconds)
    except Exception as e:
        logger.error(f"Error updating rate limit cache: {e}")
        # Fail open - allow the request if cache fails
        return False

    return False
