from django.contrib import admin

from taps.models import Beer, Brewery, SavedBeer, Tag, TagVote

admin.site.register(Beer)
admin.site.register(Brewery)
admin.site.register(SavedBeer)
admin.site.register(Tag)
admin.site.register(TagVote)
