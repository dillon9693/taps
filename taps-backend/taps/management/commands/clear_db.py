from django.core.management.base import BaseCommand

from taps.models import Beer, Brewery


class Command(BaseCommand):
    help = "Clears out DB for beers and breweries"

    def handle(self, *args, **kwargs):
        Beer.objects.all().delete()
        Brewery.objects.all().delete()
