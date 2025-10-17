import uuid

from django.contrib.auth import get_user_model
from django.db import models


class BrewerySource(models.TextChoices):
    OPEN_BREWERY_DB = "OPEN_BREWERY_DB"


class Brewery(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)  # TODO deprecate separately
    address_1 = models.CharField(max_length=100, blank=True)
    address_2 = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=50)
    state_province = models.CharField(max_length=30)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=50)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    year_founded = models.IntegerField(null=True, blank=True)
    website = models.URLField(max_length=200, blank=True)
    external_id = models.CharField(max_length=50, blank=True)
    external_source = models.CharField(choices=BrewerySource, blank=True)

    class Meta:
        verbose_name_plural = "Breweries"

    def __str__(self):
        return self.name


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name


class Beer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STYLE_CHOICES = [
        ("IPA", "India Pale Ale"),
        ("DIPA", "Double IPA"),
        ("STOUT", "Stout"),
        ("PORTER", "Porter"),
        ("LAGER", "Lager"),
        ("PILSNER", "Pilsner"),
        ("WHEAT", "Wheat Beer"),
        ("SOUR", "Sour"),
        ("OTHER", "Other"),
    ]

    name = models.CharField(max_length=100)
    brewery = models.ForeignKey(Brewery, on_delete=models.CASCADE, related_name="beers")
    style = models.CharField(max_length=20, choices=STYLE_CHOICES)
    abv = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Alcohol By Volume %",
    )
    ibu = models.IntegerField(
        null=True, blank=True, help_text="International Bitterness Units"
    )
    description = models.TextField(blank=True)
    average_rating = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    image_url = models.URLField(max_length=200, blank=True)
    tags = models.ManyToManyField(Tag, related_name="beers", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} by {self.brewery.name}"


class TagVote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="votes")
    beer = models.ForeignKey(Beer, on_delete=models.CASCADE, related_name="tag_votes")
    upvote = models.BooleanField()
    user = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE, related_name="tag_votes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("tag", "beer", "user")

    def __str__(self):
        return (
            f"{'Upvote' if self.upvote else 'Downvote'} for {self.tag.name} on "
            f"{self.beer.name}"
        )

    @classmethod
    def vote_count(cls, beer: Beer, tag: Tag, upvote: bool):
        """
        Gets the count of votes by type (upvote for downvote) for a given beer and tag.
        """
        return cls.objects.filter(beer=beer, tag=tag, upvote=upvote).count()


class SavedBeer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    beer = models.ForeignKey(Beer, on_delete=models.CASCADE, related_name="user_saves")
    user = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE, related_name="saved_beers"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("beer", "user")

    def __str__(self):
        return f"Saved beer for beer {self.beer.name} and user ID {self.user.id}"
