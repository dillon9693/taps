from django.db import models

class Brewery(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Beer(models.Model):
    name = models.CharField(max_length=100)
    brewery = models.ForeignKey(Brewery, on_delete=models.CASCADE)

    def __str__(self):
        return self.name