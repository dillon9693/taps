from django.db import models


class Brewery(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Breweries"


class Tag(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name


class Beer(models.Model):
    name = models.CharField(max_length=100)
    brewery = models.ForeignKey(Brewery, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag, related_name="beers", blank=True)

    def __str__(self):
        return self.name
