from django.contrib.admin.views.decorators import staff_member_required
from django.core.serializers import serialize
from django.shortcuts import render
from django.contrib import admin

from core.models import ServiceOrder


@staff_member_required
def map_view(request):
    all_orders = ServiceOrder.objects.all()
    context = admin.site.each_context(request)

    orders_geojson = serialize(
        'geojson',
        all_orders,
        geometry_field='location',
        fields=('title', 'status', 'description', 'priority', 'creation_date', 'responsible__first_name')
    )

    context.update({'orders_geojson': orders_geojson})
    return render(request, 'admin/map.html', context)