"""
Custom middleware for taps_backend project.
"""


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
        if request.path.startswith('/taps/health/'):
            # Override the META to prevent SecurityMiddleware from redirecting
            request.META['HTTP_X_FORWARDED_PROTO'] = 'https'
            request._is_secure_override = True

        response = self.get_response(request)
        return response
