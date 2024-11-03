from django.contrib import admin

from maps.models import MapDummy


@admin.register(MapDummy)
class MapDummyAdmin(admin.ModelAdmin):
    pass
