import graphene
from graphene_django import DjangoObjectType

from taps.models import Beer, Brewery


class BreweryType(DjangoObjectType):
    class Meta:
        model = Brewery
        fields = ("id", "name", "beers")


class BeerType(DjangoObjectType):
    class Meta:
        model = Beer
        fields = ("id", "name", "brewery")


class Query(graphene.ObjectType):
    all_beers = graphene.List(BeerType)
    brewery_by_name = graphene.Field(BreweryType, name=graphene.String(required=True))

    def resolve_all_beers(root, info):
        return Beer.objects.select_related("brewery").all()

    def resolve_brewery_by_name(root, info, name):
        try:
            return Brewery.objects.get(name=name)
        except Brewery.DoesNotExist:
            return None


schema = graphene.Schema(query=Query)
