"""
Custom middleware for taps_backend project.
"""

import json
import logging

from taps.rate_limit import check_rate_limit

logger = logging.getLogger(__name__)


class GraphQLRateLimitMiddleware:
    """
    Middleware to apply base rate limiting to GraphQL operations.

    This middleware distinguishes between queries and mutations and applies
    different rate limits accordingly. It runs before individual resolver
    rate limits as a first layer of defense.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only apply to GraphQL endpoint
        if request.path == "/graphql" and request.method == "POST":
            try:
                # Parse GraphQL request to determine operation type
                body = json.loads(request.body)
                query = body.get("query", "")

                # Simple heuristic: if query contains "mutation", it's a mutation
                # This is a coarse check; fine-grained limits are in resolvers
                is_mutation = "mutation" in query.lower()

                # Get appropriate rate limit
                if is_mutation:
                    anon_rate = "20/15m"
                    auth_rate = "100/15m"
                    group = "graphql:mutation"
                else:
                    anon_rate = "100/15m"
                    auth_rate = "500/15m"
                    group = "graphql:query"

                # Check rate limit
                rate = auth_rate if request.user.is_authenticated else anon_rate
                is_limited = check_rate_limit(request, group, rate)

                if is_limited:
                    logger.warning(
                        f"GraphQL rate limit exceeded: {group}, "
                        f"user={'auth' if request.user.is_authenticated else 'anon'}"
                    )
                    # Return GraphQL error response
                    return self._rate_limit_response()

            except (json.JSONDecodeError, KeyError, AttributeError) as e:
                # If we can't parse the request, let it through
                # The GraphQL layer will handle invalid requests
                logger.debug(f"Could not parse GraphQL request for rate limiting: {e}")

        response = self.get_response(request)
        return response

    def _rate_limit_response(self):
        """Return a GraphQL-formatted rate limit error response."""
        from django.http import JsonResponse

        return JsonResponse(
            {
                "errors": [
                    {
                        "message": "Rate limit exceeded. Please try again later.",
                        "extensions": {"code": "RATE_LIMIT_EXCEEDED"},
                    }
                ]
            },
            status=429,
        )


class HealthCheckSSLMiddleware:
    """
    Disable SSL redirect for health check endpoints.

    This middleware should be placed before SecurityMiddleware in MIDDLEWARE
    to prevent SSL redirects for health check endpoints while maintaining
    SSL security for all other endpoints.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip SSL redirect for health check endpoints by marking them as already secure
        if request.path.startswith("/taps/health/"):
            # Override the META to prevent SecurityMiddleware from redirecting
            request.META["HTTP_X_FORWARDED_PROTO"] = "https"
            request._is_secure_override = True

        response = self.get_response(request)
        return response
