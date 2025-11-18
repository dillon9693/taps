# ruff: noqa: E501
from typing import Any

from django.core.management.base import BaseCommand

from taps.models import Beer, Brewery, Tag


class Command(BaseCommand):
    help = "Adds sample beers, breweries, and tags to the database"

    def handle(self, *args: Any, **kwargs: Any) -> None:
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
                image_url="https://nightshiftbrewing.com/wp-content/uploads/2024/01/Whirlpool_16_CanRender-e1706755968895.png",
            ),
            Beer.objects.create(
                name="Fluffy",
                brewery=brewery_night_shift,
                style="IPA",
                abv=7.0,
                ibu=55,
                description="Flagship hazy IPA that sips like fresh-squeezed hoppy orange juice with flavors of sweet clementine, fresh apricot, and ripe mango.",
                average_rating=4.6,
                image_url="https://nightshiftbrewing.com/wp-content/uploads/2024/01/Fluffy_16_CanRender-e1706754993283.png",
            ),
            Beer.objects.create(
                name="Santilli",
                brewery=brewery_night_shift,
                style="IPA",
                abv=6.0,
                ibu=60,
                description="Flagship American IPA named after Santilli Highway in Everett. Features tasting notes of pine and orange zest.",
                average_rating=4.3,
                image_url="https://nightshiftbrewing.com/wp-content/uploads/2024/01/Santilli_16_CanRender-e1706755912421.png",
            ),
            Beer.objects.create(
                name="Lime Lite",
                brewery=brewery_night_shift,
                style="LAGER",
                abv=4.3,
                ibu=18,
                description="Craft light lager with only 120 calories. Light, refreshing, and easy-drinking.",
                average_rating=4.0,
                image_url="https://nightshiftbrewing.com/wp-content/uploads/2022/11/LimeLite_WebImage-150x300.png",
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
                image_url="https://images.squarespace-cdn.com/content/v1/68137a7ade1b7b4f731c238c/c81fb14d-4ec7-46c5-972c-b1cb3ed31de5/Keeper+16oz+Can+Vertical+Mockup.png",
            ),
            Beer.objects.create(
                name="Winner",
                brewery=brewery_castle_island,
                style="IPA",
                abv=6.5,
                ibu=55,
                description="Flagship American IPA with notes of grapefruit, citrus, and pine. West coast inspired, Castle Island engineered.",
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
                image_url="https://images.squarespace-cdn.com/content/v1/68137a7ade1b7b4f731c238c/c9d9e9fa-381d-4b2d-9aad-9a3d71f2bae5/Fiver+16oz+Can+Vertical+Mockup.png",
            ),
            Beer.objects.create(
                name="Hi-Def",
                brewery=brewery_castle_island,
                style="DIPA",
                abv=8.4,
                ibu=70,
                description="Hazy Double IPA featuring Citra, Mosaic, and Idaho 7 hops. Bold and intensely flavorful.",
                average_rating=4.7,
                image_url="https://images.squarespace-cdn.com/content/v1/68137a7ade1b7b4f731c238c/05b75cb9-6012-45d0-a386-3b1101d9174e/Hi-Def+16oz+Can+Vertical+Mockup.png",
            ),
            Beer.objects.create(
                name="Bohemian Shine",
                brewery=brewery_castle_island,
                style="PILSNER",
                abv=4.9,
                ibu=35,
                description="Award-winning Czech Pilsner with a crisp, clean finish and classic noble hop character.",
                average_rating=4.4,
                image_url="https://images.squarespace-cdn.com/content/v1/68137a7ade1b7b4f731c238c/1756138376330-S0AKASUW1LF3RKOL1WQ8/Bo%27+Shine+16oz+Can+Vertical+Mockup.png",
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
                image_url="https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/96b4593b-42d0-4235-822c-74c3affc6c23/Julius+Whitebox.jpg",
            ),
            Beer.objects.create(
                name="Haze",
                brewery=brewery_tree_house,
                style="DIPA",
                abv=8.2,
                ibu=60,
                description="Double IPA that's a true juice bomb with peach, orange, and passionfruit aromas.",
                average_rating=4.7,
                image_url="https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/67c3f209-d603-4360-a7df-4a3e56e187e1/01.23.24+Beer+-+Haze.jpg",
            ),
            Beer.objects.create(
                name="Green",
                brewery=brewery_tree_house,
                style="IPA",
                abv=6.9,
                ibu=52,
                description="Cross-continental IPA with tropical notes of pineapple, orange sorbet, lemon-lime, and tangerine.",
                average_rating=4.7,
                image_url="https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/1595444435647-Q30KXMD2H4SJNDX3CHNJ/Green.jpg",
            ),
            Beer.objects.create(
                name="Very Hazy",
                brewery=brewery_tree_house,
                style="DIPA",
                abv=8.6,
                ibu=65,
                description="Double IPA that pushes the flavor profile of Haze to the limit with intense hop saturation.",
                average_rating=4.8,
                image_url="https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/1597411491931-H97F2UT5WKGWDYO6VVLZ/Very%2BHazy-11.jpg",
            ),
            Beer.objects.create(
                name="Hurricane",
                brewery=brewery_tree_house,
                style="DIPA",
                abv=8.3,
                ibu=70,
                description="Double IPA with intense Simcoe and Citra hop doses. Pungent aroma of earthy citrus with papaya, melon, and stone fruit.",
                average_rating=4.7,
                image_url="https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/1595446196955-ERE3JOL11PIJRYTD6ER6/Hurricane.jpg",
            ),
            Beer.objects.create(
                name="Lights On",
                brewery=brewery_tree_house,
                style="OTHER",
                abv=5.5,
                ibu=40,
                description="Modern American Pale Ale with a hazy orange pour and an aroma filled with sweet fresh citrus fruit.",
                average_rating=4.5,
                image_url="https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/1595446421227-X1JVOMWPLQ7DPOVVAXKT/Lights+On.jpg",
            ),
            Beer.objects.create(
                name="Super Treat",
                brewery=brewery_tree_house,
                style="DIPA",
                abv=8.3,
                ibu=60,
                description="Double IPA with saturated flavors of orange starburst, sweet tangerine, lychee, and fresh squeezed orange juice.",
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
                image_url="https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/1595444831521-BP7XSNK8CABXK8HJSG38/Summer.jpg",
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
        beers[5].tags.add(tags["Hoppy"], tags["Citrus"])  # Winner
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
