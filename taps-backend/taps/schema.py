import graphene
from django.db.models import Count
from graphene_django import DjangoObjectType

from taps.models import Beer, Brewery, Tag


class BreweryType(DjangoObjectType):
    beer_count = graphene.Int()

    class Meta:
        model = Brewery
        fields = (
            "id",
            "name",
            "location",
            "description",
            "year_founded",
            "website",
            "beers",
        )

    def resolve_beer_count(self, info):
        return self.beers.count()


class BeerType(DjangoObjectType):
    style_display = graphene.String()

    class Meta:
        model = Beer
        fields = (
            "id",
            "name",
            "brewery",
            "style",
            "abv",
            "ibu",
            "description",
            "average_rating",
            "image_url",
            "tags",
            "created_at",
            "updated_at",
        )

    def resolve_style_display(self, info):
        return self.get_style_display()


class TagType(DjangoObjectType):
    beer_count = graphene.Int()

    class Meta:
        model = Tag
        fields = ("id", "name", "beers")

    def resolve_beer_count(self, info):
        return self.beers.count()


class Query(graphene.ObjectType):
    all_beers = graphene.List(
        BeerType,
        style=graphene.String(required=False),
        min_abv=graphene.Float(required=False),
        max_abv=graphene.Float(required=False),
        search=graphene.String(required=False),
    )
    featured_beers = graphene.List(BeerType, count=graphene.Int(required=False))
    beer_by_id = graphene.Field(BeerType, id=graphene.ID(required=True))

    all_breweries = graphene.List(
        BreweryType,
        location=graphene.String(required=False),
        search=graphene.String(required=False),
    )
    brewery_by_name = graphene.Field(BreweryType, name=graphene.String(required=True))
    brewery_by_id = graphene.Field(BreweryType, id=graphene.ID(required=True))

    top_tags = graphene.List(TagType, count=graphene.Int(required=False))

    def resolve_all_beers(
        self, info, style=None, min_abv=None, max_abv=None, search=None
    ):
        qs = Beer.objects.select_related("brewery").prefetch_related("tags")

        if style:
            qs = qs.filter(style=style)
        if min_abv is not None:
            qs = qs.filter(abv__gte=min_abv)
        if max_abv is not None:
            qs = qs.filter(abv__lte=max_abv)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(
                description__icontains=search
            )

        return qs.order_by("-created_at")

    def resolve_featured_beers(self, info, count=6):
        return (
            Beer.objects.select_related("brewery")
            .prefetch_related("tags")
            .filter(average_rating__isnull=False)
            .order_by("-average_rating")[:count]
        )

    def resolve_beer_by_id(self, info, id):
        try:
            return (
                Beer.objects.select_related("brewery")
                .prefetch_related("tags")Be
                .get(id=id)
            )
        except Beer.DoesNotExist:
            return None

    def resolve_all_breweries(self, info, location=None, search=None):
        qs = Brewery.objects.prefetch_related("beers")

        if location:
            qs = qs.filter(location__icontains=location)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(
                description__icontains=search
            )

        return qs.order_by("name")

    def resolve_brewery_by_name(self, info, name):
        try:
            return Brewery.objects.prefetch_related("beers").get(name=name)
        except Brewery.DoesNotExist:
            return None

    def resolve_brewery_by_id(self, info, id):
        try:
            return Brewery.objects.prefetch_related("beers").get(id=id)
        except Brewery.DoesNotExist:
            return None

    def resolve_top_tags(self, info, count=10):
        return (
            Tag.objects.prefetch_related("beers")
            .annotate(beer_count=Count("beers"))
            .order_by("-beer_count", "name")[:count]
        )


schema = graphene.Schema(query=Query)
