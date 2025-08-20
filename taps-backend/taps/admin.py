from django.contrib import admin

from taps.models import Beer, Brewery, Tag

admin.site.register(Beer)
admin.site.register(Brewery)
admin.site.register(Tag)
