from django.contrib.admin.views.decorators import staff_member_required
from django.core.serializers import serialize
from django.shortcuts import render
from django.contrib import admin

from core.models import ServiceOrder


@staff_member_required
def map_view(request):
    open_orders = ServiceOrder.objects.filter(status="ABERTA")
    context = admin.site.each_context(request)

    # Inclui campos adicionais no GeoJSON
    orders_geojson = serialize(
        'geojson',
        open_orders,
        geometry_field='location',
        fields=('title', 'status', 'description', 'priority', 'creation_date', 'responsible__first_name')
    )

    context.update({'orders_geojson': orders_geojson})
    return render(request, 'admin/map.html', context)