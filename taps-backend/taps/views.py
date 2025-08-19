from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt


def index(request):
    """
    Index view.
    """
    return HttpResponse("Welcome to Taps API")


@csrf_exempt
def health_check(request):
    """
    Health check endpoint for AWS ECS and load balancer.
    """
    return JsonResponse({"status": "healthy"})
