from django.core.management.base import BaseCommand
from django.utils import timezone
from taps.models import Beer, Brewery, Tag

class Command(BaseCommand):
    help = 'Adds sample beers, breweries, and tags to the database'

    def handle(self, *args, **kwargs):
        # Create some breweries
        breweries = {
            'Cloudy Bay Brewing': Brewery.objects.create(
                name='Cloudy Bay Brewing',
                location='Portland, OR',
                description='Craft brewery specializing in hazy IPAs and experimental brews',
                year_founded=2018,
                website='https://cloudybaybrewing.com'
            ),
            'Dark Horse': Brewery.objects.create(
                name='Dark Horse',
                location='Denver, CO',
                description='Known for rich stouts and barrel-aged beers',
                year_founded=2010,
                website='https://darkhorsebrewery.com'
            ),
            'Golden Coast': Brewery.objects.create(
                name='Golden Coast',
                location='San Diego, CA',
                description='West coast style beers with a modern twist',
                year_founded=2015,
                website='https://goldencoastbrews.com'
            ),
        }

        # Create some tags
        tags = {
            'Hoppy': Tag.objects.create(name='Hoppy'),
            'Citrus': Tag.objects.create(name='Citrus'),
            'Dark': Tag.objects.create(name='Dark'),
            'Roasted': Tag.objects.create(name='Roasted'),
            'Smooth': Tag.objects.create(name='Smooth'),
            'Fruity': Tag.objects.create(name='Fruity'),
            'Barrel Aged': Tag.objects.create(name='Barrel Aged'),
        }

        # Create some beers
        beers = [
            Beer.objects.create(
                name='Hazy Daydream',
                brewery=breweries['Cloudy Bay Brewing'],
                style='IPA',
                abv=6.8,
                ibu=65,
                description='A juicy, hazy IPA bursting with tropical fruit notes. Heavy on Citra and Mosaic hops.',
                average_rating=4.5,
                image_url='https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ),
            Beer.objects.create(
                name='Midnight Velvet',
                brewery=breweries['Dark Horse'],
                style='STOUT',
                abv=9.2,
                ibu=45,
                description='Imperial stout aged in bourbon barrels. Rich chocolate and coffee notes with a smooth finish.',
                average_rating=4.7,
                image_url='https://images.unsplash.com/photo-1518176258769-f227c798150e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ),
            Beer.objects.create(
                name='West Coast Wonder',
                brewery=breweries['Golden Coast'],
                style='IPA',
                abv=7.2,
                ibu=75,
                description='Classic West Coast IPA with bold pine and citrus character. Clean, crisp, and assertively hopped.',
                average_rating=4.3,
                image_url='https://images.unsplash.com/photo-1532634922-8fe0b757fb13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ),
        ]

        # Add tags to beers
        beers[0].tags.add(tags['Hoppy'], tags['Citrus'], tags['Fruity'])
        beers[1].tags.add(tags['Dark'], tags['Roasted'], tags['Barrel Aged'])
        beers[2].tags.add(tags['Hoppy'], tags['Citrus'])

        self.stdout.write(self.style.SUCCESS('Successfully added sample data'))
