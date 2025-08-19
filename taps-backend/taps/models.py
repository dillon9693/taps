from django.db import models


class Brewery(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    year_founded = models.IntegerField(null=True, blank=True)
    website = models.URLField(max_length=200, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Breweries"


class Tag(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name


class Beer(models.Model):
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

    def __str__(self):
        return f"{self.name} by {self.brewery.name}"

    class Meta:
        ordering = ["-created_at"]
