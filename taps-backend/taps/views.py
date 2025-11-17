from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt


def index(request: HttpRequest) -> int:
    """
    Index view.
    """
    return HttpResponse("Welcome to Taps API")


@csrf_exempt
def health_check(request: HttpRequest) -> JsonResponse:
    """
    Health check endpoint for AWS ECS and load balancer.
    """
    return JsonResponse({"status": "healthy"})
