import graphene
from graphene_django import DjangoObjectType
from django.db.models import Count

from taps.models import Beer, Brewery, Tag


class BreweryType(DjangoObjectType):
    class Meta:
        model = Brewery
        fields = ("id", "name", "beers")


class BeerType(DjangoObjectType):
    class Meta:
        model = Beer
        fields = ("id", "name", "brewery")


class TagType(DjangoObjectType):
    class Meta:
        model = Tag
        fields = ("id", "name", "beers")


class Query(graphene.ObjectType):
    all_beers = graphene.List(BeerType)
    brewery_by_name = graphene.Field(BreweryType, name=graphene.String(required=True))
    top_tags = graphene.List(TagType, count=graphene.Int(required=False))

    def resolve_all_beers(root, info):
        return Beer.objects.select_related("brewery").all()

    def resolve_brewery_by_name(root, info, name):
        try:
            return Brewery.objects.get(name=name)
        except Brewery.DoesNotExist:
            return None

    # Gets top N tags ordered by number of beers associated with the tag
    def resolve_top_tags(root, info, count=10):
        # TODO move this query into a module or a class method on the Tag model
        return (
            Tag.objects.prefetch_related("beers")
            .annotate(beer_count=Count("beers"))
            .order_by("-beer_count", "name")[:count]
        )


schema = graphene.Schema(query=Query)
