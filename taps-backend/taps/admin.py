from django.contrib import admin

from taps.models import Beer, Brewery, Tag, TagVote

admin.site.register(Beer)
admin.site.register(Brewery)
admin.site.register(Tag)
admin.site.register(TagVote)
