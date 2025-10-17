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
        except Brewery.DoesNotExist as e:
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

        # Create some beers
        beers = [
            Beer.objects.create(
                name="Hazy Daydream",
                brewery=brewery_night_shift,
                style="IPA",
                abv=6.8,
                ibu=65,
                description="A juicy, hazy IPA bursting with tropical fruit notes. Heavy on Citra and Mosaic hops.",
                average_rating=4.5,
                image_url="https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Midnight Velvet",
                brewery=brewery_night_shift,
                style="STOUT",
                abv=9.2,
                ibu=45,
                description="Imperial stout aged in bourbon barrels. Rich chocolate and coffee notes with a smooth finish.",
                average_rating=4.7,
                image_url="https://images.unsplash.com/photo-1518176258769-f227c798150e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="West Coast Wonder",
                brewery=brewery_night_shift,
                style="IPA",
                abv=7.2,
                ibu=75,
                description="Classic West Coast IPA with bold pine and citrus character. Clean, crisp, and assertively hopped.",
                average_rating=4.3,
                image_url="https://images.unsplash.com/photo-1532634922-8fe0b757fb13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Alpine Sunrise",
                brewery=brewery_night_shift,
                style="WHEAT",
                abv=5.4,
                ibu=18,
                description="Light and refreshing wheat beer with notes of orange peel and coriander. Perfect for summer days.",
                average_rating=4.2,
                image_url="https://images.unsplash.com/photo-1566633806327-68e152aaf26d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Evergreen IPA",
                brewery=brewery_castle_island,
                style="IPA",
                abv=6.5,
                ibu=60,
                description="Pine-forward IPA with a balanced malt backbone. Brewed with locally sourced mountain water.",
                average_rating=4.4,
                image_url="https://images.unsplash.com/photo-1523567830207-96731740fa71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Lone Star Lager",
                brewery=brewery_castle_island,
                style="LAGER",
                abv=4.8,
                ibu=22,
                description="Crisp, clean lager with a touch of Texas wildflower honey. Easy drinking for hot summer days.",
                average_rating=4.0,
                image_url="https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Pecan Porter",
                brewery=brewery_castle_island,
                style="PORTER",
                abv=6.2,
                ibu=30,
                description="Robust porter brewed with Texas pecans. Notes of chocolate, coffee, and toasted nuts.",
                average_rating=4.6,
                image_url="https://images.unsplash.com/photo-1587582345426-bf07d078f622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Windy City Wit",
                brewery=brewery_castle_island,
                style="WHEAT",
                abv=5.0,
                ibu=15,
                description="Belgian-style witbier with a Chicago twist. Brewed with orange peel, coriander, and a hint of chamomile.",
                average_rating=4.1,
                image_url="https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Loop DIPA",
                brewery=brewery_castle_island,
                style="DIPA",
                abv=8.5,
                ibu=85,
                description="Bold, juicy double IPA with intense tropical fruit flavors. Named after Chicago's famous Loop district.",
                average_rating=4.7,
                image_url="https://images.unsplash.com/photo-1558642891-54be180ea339?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Lakefront Pilsner",
                brewery=brewery_tree_house,
                style="PILSNER",
                abv=5.2,
                ibu=35,
                description="Classic German-style pilsner with a crisp, clean finish. Brewed with imported German malt and hops.",
                average_rating=4.3,
                image_url="https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Emerald Haze",
                brewery=brewery_tree_house,
                style="IPA",
                abv=6.7,
                ibu=55,
                description="Pacific Northwest hazy IPA featuring locally grown hops. Notes of pine, citrus, and tropical fruit.",
                average_rating=4.5,
                image_url="https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Rainier Red",
                brewery=brewery_tree_house,
                style="OTHER",
                abv=5.8,
                ibu=40,
                description="Amber ale with caramel malt sweetness balanced by Pacific Northwest hops. Smooth and approachable.",
                average_rating=4.2,
                image_url="https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Puget Sour",
                brewery=brewery_tree_house,
                style="SOUR",
                abv=4.5,
                ibu=10,
                description="Kettle sour with blackberries and raspberries. Tart, fruity, and refreshing.",
                average_rating=4.4,
                image_url="https://images.unsplash.com/photo-1558642084-fd07fae5282e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Bourbon Barrel Quad",
                brewery=brewery_tree_house,
                style="OTHER",
                abv=10.5,
                ibu=25,
                description="Belgian-style quadrupel aged in bourbon barrels. Rich, complex, with notes of dark fruit, caramel, and vanilla.",
                average_rating=4.8,
                image_url="https://images.unsplash.com/photo-1584225064785-c62a8b43d148?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Nashville Brown",
                brewery=brewery_tree_house,
                style="OTHER",
                abv=5.5,
                ibu=28,
                description="English-style brown ale with a Southern twist. Notes of toffee, nuts, and a hint of chocolate.",
                average_rating=4.3,
                image_url="https://images.unsplash.com/photo-1518099074172-2e47ee6cfdc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Foggy Morning",
                brewery=brewery_tree_house,
                style="WHEAT",
                abv=5.2,
                ibu=12,
                description="Hefeweizen with traditional banana and clove notes. Smooth, creamy, and perfect for brunch.",
                average_rating=4.1,
                image_url="https://images.unsplash.com/photo-1587582345426-bf07d078f622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Barrel-Aged Imperial Porter",
                brewery=brewery_tree_house,
                style="PORTER",
                abv=9.8,
                ibu=40,
                description="Robust porter aged in rye whiskey barrels. Complex flavors of chocolate, coffee, vanilla, and spice.",
                average_rating=4.9,
                image_url="https://images.unsplash.com/photo-1587582345426-bf07d078f622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Sunset Saison",
                brewery=brewery_tree_house,
                style="OTHER",
                abv=6.2,
                ibu=25,
                description="Farmhouse saison with notes of pepper, citrus, and a hint of honey. Dry finish with a touch of funk.",
                average_rating=4.4,
                image_url="https://images.unsplash.com/photo-1587582345426-bf07d078f622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Music City Pilsner",
                brewery=brewery_tree_house,
                style="PILSNER",
                abv=4.9,
                ibu=32,
                description="Czech-style pilsner with a crisp, clean finish. Traditional noble hops provide a spicy, floral character.",
                average_rating=4.2,
                image_url="https://images.unsplash.com/photo-1586993451228-09818021e309?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
            Beer.objects.create(
                name="Riverside Honey Wheat",
                brewery=brewery_tree_house,
                style="WHEAT",
                abv=5.1,
                ibu=20,
                description="Smooth wheat beer brewed with local Texas honey. Light, refreshing, with subtle honey sweetness.",
                average_rating=4.3,
                image_url="https://images.unsplash.com/photo-1523567830207-96731740fa71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            ),
        ]

        # Add tags to beers
        beers[0].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])
        beers[1].tags.add(tags["Dark"], tags["Roasted"], tags["Barrel Aged"])
        beers[2].tags.add(tags["Hoppy"], tags["Citrus"])

        # Add tags to new beers
        beers[3].tags.add(tags["Fruity"], tags["Smooth"])
        beers[4].tags.add(tags["Hoppy"], tags["Citrus"])
        beers[5].tags.add(tags["Smooth"])
        beers[6].tags.add(tags["Dark"], tags["Roasted"])
        beers[7].tags.add(tags["Fruity"], tags["Smooth"])
        beers[8].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])
        beers[9].tags.add(tags["Smooth"])
        beers[10].tags.add(tags["Hoppy"], tags["Citrus"], tags["Fruity"])
        beers[11].tags.add(tags["Smooth"])
        beers[12].tags.add(tags["Fruity"])
        beers[13].tags.add(tags["Dark"], tags["Barrel Aged"])
        beers[14].tags.add(tags["Dark"], tags["Smooth"])
        beers[15].tags.add(tags["Fruity"], tags["Smooth"])
        beers[16].tags.add(tags["Dark"], tags["Roasted"], tags["Barrel Aged"])
        beers[17].tags.add(tags["Fruity"], tags["Smooth"])
        beers[18].tags.add(tags["Smooth"])
        beers[19].tags.add(tags["Fruity"], tags["Smooth"])

        self.stdout.write(self.style.SUCCESS("Successfully added sample data"))
