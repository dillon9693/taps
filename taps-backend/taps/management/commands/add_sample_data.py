# ruff: noqa: E501
from django.core.management.base import BaseCommand

from taps.models import Beer, Brewery, Tag


class Command(BaseCommand):
    help = "Adds sample beers, breweries, and tags to the database"

    def handle(self, *args, **kwargs):
        # Get some breweries from imported data (from import_brewery_data command)
        try:
            brewery_castle_island = Brewery.objects.get(
                name="Castle Island Brewing Co."
            )
            brewery_night_shift = Brewery.objects.get(name="Night Shift Brewing, Inc")
            brewery_tree_house = Brewery.objects.get(name="Tree House Brewery")
        except Brewery.DoesNotExist:
            self.stderr.write(
                "Missing brewery data. Run import_brewery_data command first!"
            )
            return

        # Create some tags
        tags = {
            "Hoppy": Tag.objects.create(name="Hoppy"),
            "Citrus": Tag.objects.create(name="Citrus"),
            "Dark": Tag.objects.create(name="Dark"),
            "Roasted": Tag.objects.create(name="Roasted"),
            "Smooth": Tag.objects.create(name="Smooth"),
            "Fruity": Tag.objects.create(name="Fruity"),
            "Barrel Aged": Tag.objects.create(name="Barrel Aged"),
        }

        # Create some beers from real Massachusetts breweries
        beers = [
            # Night Shift Brewing beers
            Beer.objects.create(
                name="Whirlpool",
                brewery=brewery_night_shift,
                style="OTHER",
                abv=4.5,
                ibu=50,
                description="New England Pale Ale with a hazy blonde pour and nose of ripe peach and clementine. Sips citrusy and vibrant.",
                average_rating=4.4,
                image_url="https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Fluffy",
                brewery=brewery_night_shift,
                style="IPA",
                abv=7.0,
                ibu=55,
                description="Flagship hazy IPA that sips like fresh-squeezed hoppy orange juice with flavors of sweet clementine, fresh apricot, and ripe mango.",
                average_rating=4.6,
                image_url="https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Santilli",
                brewery=brewery_night_shift,
                style="IPA",
                abv=6.0,
                ibu=60,
                description="Flagship American IPA named after Santilli Highway in Everett. Features tasting notes of pine and orange zest.",
                average_rating=4.3,
                image_url="https://images.unsplash.com/photo-1532634922-8fe0b757fb13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Lime Lite",
                brewery=brewery_night_shift,
                style="LAGER",
                abv=4.3,
                ibu=18,
                description="Craft light lager with only 120 calories. Light, refreshing, and easy-drinking.",
                average_rating=4.0,
                image_url="https://images.unsplash.com/photo-1566633806327-68e152aaf26d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            # Castle Island Brewing beers
            Beer.objects.create(
                name="Keeper",
                brewery=brewery_castle_island,
                style="IPA",
                abv=6.5,
                ibu=60,
                description="Flagship American IPA brewed with Simcoe and Cascade hops. Balanced and approachable with citrus and pine notes.",
                average_rating=4.4,
                image_url="https://images.unsplash.com/photo-1523567830207-96731740fa71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Winner",
                brewery=brewery_castle_island,
                style="LAGER",
                abv=4.7,
                ibu=20,
                description="Award-winning American lager. Silver Medal at 2018 Great American Beer Festival and Gold Medal at 2018 U.S. Open Beer Championship.",
                average_rating=4.5,
                image_url="https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Fiver",
                brewery=brewery_castle_island,
                style="IPA",
                abv=6.3,
                ibu=50,
                description="Juicy, hazy IPA featuring Citra, Simcoe, and El Dorado hops. Bursting with tropical fruit flavors.",
                average_rating=4.5,
                image_url="https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Hi-Def",
                brewery=brewery_castle_island,
                style="DIPA",
                abv=8.4,
                ibu=70,
                description="Hazy Double IPA featuring Citra, Mosaic, and Idaho 7 hops. Bold and intensely flavorful.",
                average_rating=4.7,
                image_url="https://images.unsplash.com/photo-1558642891-54be180ea339?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Bohemian Shine",
                brewery=brewery_castle_island,
                style="PILSNER",
                abv=4.9,
                ibu=35,
                description="Award-winning Czech Pilsner with a crisp, clean finish and classic noble hop character.",
                average_rating=4.4,
                image_url="https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            # Tree House Brewery beers
            Beer.objects.create(
                name="Julius",
                brewery=brewery_tree_house,
                style="IPA",
                abv=6.8,
                ibu=55,
                description="Flagship IPA that's bright and juicy, filled with flavors and aromas of mango, peach, passionfruit, and citrus juice.",
                average_rating=4.8,
                image_url="https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Haze",
                brewery=brewery_tree_house,
                style="IPA",
                abv=6.7,
                ibu=50,
                description="Peach-forward hazy IPA with beautiful hop aromatics and a smooth, juicy character.",
                average_rating=4.7,
                image_url="https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Green",
                brewery=brewery_tree_house,
                style="IPA",
                abv=6.9,
                ibu=52,
                description="Pineapple-forward IPA with tropical fruit flavors and a hazy, juicy profile.",
                average_rating=4.7,
                image_url="https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Very Hazy",
                brewery=brewery_tree_house,
                style="DIPA",
                abv=8.6,
                ibu=65,
                description="Double IPA that conveys all the beautiful flavors of Haze with even greater depth and potency.",
                average_rating=4.8,
                image_url="https://images.unsplash.com/photo-1558642891-54be180ea339?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Hurricane",
                brewery=brewery_tree_house,
                style="DIPA",
                abv=8.3,
                ibu=70,
                description="Double IPA with intense Simcoe and Citra hop doses. Pungent aroma of earthy citrus with papaya, melon, and stone fruit.",
                average_rating=4.7,
                image_url="https://images.unsplash.com/photo-1558642891-54be180ea339?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Lights On",
                brewery=brewery_tree_house,
                style="OTHER",
                abv=5.5,
                ibu=40,
                description="Modern American Pale Ale with a hazy orange pour and an aroma filled with sweet fresh citrus fruit.",
                average_rating=4.5,
                image_url="https://images.unsplash.com/photo-1523567830207-96731740fa71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Super Treat",
                brewery=brewery_tree_house,
                style="IPA",
                abv=8.3,
                ibu=60,
                description="Intensely hoppy IPA with big tropical fruit character and a dangerously drinkable finish.",
                average_rating=4.6,
                image_url="https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Summer",
                brewery=brewery_tree_house,
                style="IPA",
                abv=8.1,
                ibu=58,
                description="Bright and refreshing IPA with vibrant hop aromatics perfect for warm weather.",
                average_rating=4.5,
                image_url="https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
        ]

        # Add tags to beers
        # Night Shift beers
        beers[0].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Whirlpool
        beers[1].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Fluffy
        beers[2].tags.add(tags["Hoppy"], tags["Citrus"])  # Santilli
        beers[3].tags.add(tags["Smooth"])  # Lime Lite
        # Castle Island beers
        beers[4].tags.add(tags["Hoppy"], tags["Citrus"])  # Keeper
        beers[5].tags.add(tags["Smooth"])  # Winner
        beers[6].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Fiver
        beers[7].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Hi-Def
        beers[8].tags.add(tags["Smooth"])  # Bohemian Shine
        # Tree House beers
        beers[9].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Julius
        beers[10].tags.add(tags["Hoppy"], tags["Fruity"])  # Haze
        beers[11].tags.add(tags["Hoppy"], tags["Fruity"])  # Green
        beers[12].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Very Hazy
        beers[13].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Hurricane
        beers[14].tags.add(tags["Hoppy"], tags["Citrus"])  # Lights On
        beers[15].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Super Treat
        beers[16].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])  # Summer

        self.stdout.write(self.style.SUCCESS("Successfully added sample data"))
