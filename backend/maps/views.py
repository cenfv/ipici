
from core.models import ServiceOrder, Zone, LightingDevice
from django.contrib import admin
from django.db.models import F
from django.http import JsonResponse
from django.core.serializers import serialize
from django.db.models import Value
from django.db.models.functions import Concat
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.conf import settings
import json


def get_zone_geometry(request, zone_id):
    zone = Zone.objects.filter(id=zone_id)
    geojson = serialize('geojson', zone, geometry_field='location')

    geojson_dict = json.loads(geojson)

    return JsonResponse(geojson_dict, safe=False)

@staff_member_required
def service_order_map_view(request):
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

    return render(request, 'admin/service_order_map.html', context)


@staff_member_required
def device_map_view(request):
    all_devices = LightingDevice.objects.annotate(
        zone_name=Concat(Value('Zona: '), F('zone__name')),
        full_address=Concat(
            F('address__street'), Value(', '), F('address__number'), Value(' - '),
            F('address__city'), Value(', '), F('address__state'), Value(', '),
            F('address__country__name')
        ),
    ).values(
        'code', 'owner', 'structural_name', 'type', 'height', 'material',
        'installation_date', 'location', 'device_image', 'operational_status',
        'qr_code', 'energy_source', 'zone_name', 'additional_features','nearby_installations', 'full_address', 'last_maintenance_date'
    )

    devices_geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    for device in all_devices:
        feature = {
            "type": "Feature",
            "geometry": json.loads(device['location'].geojson),
            "properties": {
                "code": device['code'],
                "owner": device['owner'],
                "structural_name": device['structural_name'],
                "type": device['type'],
                "height": device['height'],
                "material": device['material'],
                "installation_date": device['installation_date'].strftime('%Y-%m-%d'),
                "operational_status": device['operational_status'],
                "qr_code": device['qr_code'],
                "energy_source": device['energy_source'],
                "zone_name": device['zone_name'] or "Não informado",
                "additional_features": device['additional_features'] or "Não informado",
                "address": device['full_address'] or "Não informado",
                "device_image": f"{settings.BASE_URL}/media/{device['device_image']}" if device["device_image"] else None,
                'nearby_installations': device['nearby_installations'] or "Não informado",
                'last_maintenance_date': device['last_maintenance_date'].strftime('%Y-%m-%d') if device['last_maintenance_date'] else "Não informado"
            }
        }
        devices_geojson["features"].append(feature)

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

    device_types = LightingDevice.TYPE_CHOICES
    operational_statuses = LightingDevice.STATUS_CHOICES

    context = admin.site.each_context(request)
    context.update({
        'devices_geojson': json.dumps(devices_geojson),
        'zones_geojson': json.dumps(zones_geojson),
        'leaflet_config': json.dumps(leaflet_config),
        'device_types': device_types,
        'operational_statuses': operational_statuses
    })

    return render(request, 'admin/device_map.html', context)

