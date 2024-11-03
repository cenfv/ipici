from django.conf import settings
from django.shortcuts import render
from core.models import ServiceOrder
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import admin
from django.db.models import F, Value
from django.db.models.functions import Concat
import json


@staff_member_required
def map_view(request):
    all_orders = ServiceOrder.objects.annotate(
        author_name=Concat(F('author__first_name'), Value(' '), F('author__last_name')),
        responsible_name=Concat(F('responsible__first_name'), Value(' '), F('responsible__last_name'))
    ).values(
        'title', 'status', 'description', 'priority', 'creation_date', 'location',
        'author_name', 'responsible_name'
    )

    orders_geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    for order in all_orders:
        feature = {
            "type": "Feature",
            "geometry": json.loads(order['location'].geojson),
            "properties": {
                "title": order['title'],
                "status": order['status'],
                "description": order['description'],
                "priority": order['priority'],
                "creation_date": order['creation_date'].strftime('%Y-%m-%d %H:%M:%S'),
                "author_name": order['author_name'],
                "responsible_name": order['responsible_name']
            }
        }
        orders_geojson["features"].append(feature)

    leaflet_config = {
        'DEFAULT_CENTER': settings.LEAFLET_CONFIG['DEFAULT_CENTER'],
        'DEFAULT_ZOOM': settings.LEAFLET_CONFIG['DEFAULT_ZOOM'],
        'TILES': settings.LEAFLET_CONFIG['TILES'],
        'ATTRIBUTION_PREFIX': settings.LEAFLET_CONFIG['ATTRIBUTION_PREFIX']
    }

    context = admin.site.each_context(request)
    context.update({
        'orders_geojson': json.dumps(orders_geojson),
        'leaflet_config': json.dumps(leaflet_config)
    })

    return render(request, 'admin/map.html', context)
