from django.conf import settings
from django.shortcuts import render
from core.models import ServiceOrder, Zone  # Import Zone model
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import admin
from django.db.models import F, Value
from django.db.models.functions import Concat
import json
from django.http import JsonResponse
from django.core.serializers import serialize

def get_zone_geometry(request, zone_id):
    zone = Zone.objects.filter(id=zone_id)
    geojson = serialize('geojson', zone, geometry_field='location')

    geojson_dict = json.loads(geojson)

    return JsonResponse(geojson_dict, safe=False)

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

    all_zones = Zone.objects.values('name', 'description', 'location', 'city', 'region', 'neighborhood', 'boundary_color')

    zones_geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    for zone in all_zones:
        feature = {
            "type": "Feature",
            "geometry": json.loads(zone['location'].geojson),
            "properties": {
                "name": zone['name'],
                "description": zone['description'] or "Sem descrição",
                "city": zone['city'] or "Desconhecido",
                "region": zone['region'] or "Desconhecido",
                "neighborhood": zone['neighborhood'] or "Desconhecido",
                "boundary_color": zone['boundary_color'],
            }
        }
        zones_geojson["features"].append(feature)

    leaflet_config = {
        'DEFAULT_CENTER': settings.LEAFLET_CONFIG['DEFAULT_CENTER'],
        'DEFAULT_ZOOM': settings.LEAFLET_CONFIG['DEFAULT_ZOOM'],
        'TILES': settings.LEAFLET_CONFIG['TILES'],
        'ATTRIBUTION_PREFIX': settings.LEAFLET_CONFIG['ATTRIBUTION_PREFIX']
    }

    context = admin.site.each_context(request)
    context.update({
        'orders_geojson': json.dumps(orders_geojson),
        'zones_geojson': json.dumps(zones_geojson),
        'leaflet_config': json.dumps(leaflet_config)
    })

    return render(request, 'admin/map.html', context)
