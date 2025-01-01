from django.contrib import admin
from django.contrib.auth.models import Group
from django.utils.html import format_html
from django.db import models
from django.db.models import fields
from django.db.models.expressions import ExpressionWrapper
from .forms import ZoneAdminForm
from .models import (
    AuditLog, LightingDevice, Maintenance,
    OperationalCost, ReportedProblem, Sensor, ServiceOrder, Zone, MailHistory, Address
)
from leaflet.admin import LeafletGeoAdmin
from analytics.models import Report



try:
    from rest_framework.authtoken.models import TokenProxy as DRFToken
except ImportError:
    from rest_framework.authtoken.models import Token as DRFToken

admin.site.unregister(Group)
admin.site.unregister(DRFToken)

# @admin.register(Country)
# class CountryAdmin(admin.ModelAdmin):
#     list_display = ('name', 'code')
#     search_fields = ('name', 'code')


class MaintenanceInline(admin.TabularInline):
    model = Maintenance
    extra = 1


class OperationalCostInline(admin.TabularInline):
    model = OperationalCost
    extra = 1


class ReportedProblemInline(admin.TabularInline):
    model = ReportedProblem
    extra = 1


class SensorInline(admin.TabularInline):
    model = Sensor
    extra = 1

@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('device', 'maintenance_date', 'description', 'responsible_technician', 'operational_cost')
    search_fields = ('device__number', 'responsible_technician__email', 'description')
    list_filter = ('maintenance_date', 'responsible_technician', 'operational_cost')


@admin.register(OperationalCost)
class OperationalCostAdmin(admin.ModelAdmin):
    list_display = ('device', 'cost_type', 'value', 'date', 'description')
    search_fields = ('device__number', 'cost_type', 'description')
    list_filter = ('cost_type', 'date')


@admin.register(ReportedProblem)
class ReportedProblemAdmin(admin.ModelAdmin):
    list_display = ('user', 'device', 'status', 'report_date', 'description', 'origin')
    search_fields = ('user__email', 'device__number', 'status', 'description')
    list_filter = ('status', 'report_date', 'origin')


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('device', 'sensor_status', 'last_report_date', 'connection_type', 'firmware_version', 'battery_level')
    search_fields = ('device__number', 'sensor_status', 'connection_type', 'firmware_version')
    list_filter = ('sensor_status', 'connection_type')

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('street', 'number', 'neighborhood', 'complement', 'city', 'state', 'country', 'zip_code')
    search_fields = ('street', 'number', 'neighborhood', 'city', 'state', 'country__name', 'zip_code')
    list_filter = ('state', 'country')


@admin.register(LightingDevice)
class LightingDeviceAdmin(LeafletGeoAdmin):
    list_display = (
    'code', 'owner', 'structural_name', 'type', 'height', 'material', 'installation_date', 'operational_status', 'qr_code', 'energy_source', 'zone', 'address')
    search_fields = ('code', 'owner', 'structural_name', 'qr_code', 'energy_source')
    list_filter = ('type', 'operational_status', 'zone', 'address')
    inlines = [MaintenanceInline, OperationalCostInline, SensorInline]
    fieldsets = (
        (None, {
            'fields': (
            'code', 'owner', 'structural_name', 'type', 'height', 'material', 'installation_date', 'address', 'zone', 'location')
        }),
        ('Operational Info', {
            'fields': ('operational_status', 'qr_code', 'energy_source', 'last_maintenance_date')
        }),
        ('Additional Info', {
            'fields': ('device_image', 'additional_features', 'nearby_installations')
        }),
    )

    class Media:
        css = {
            'all': [
                'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
                'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css'
            ]
        }
        js = [
            'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
            'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js',
            'js/load_zone_on_select.js'
        ]


@admin.register(ServiceOrder)
class ServiceOrderAdmin(LeafletGeoAdmin):
    list_display = ('title', 'priority', 'status', 'responsible', 'author', 'creation_date', 'problem_type', 'device')
    search_fields = ('title', 'description', 'responsible__email', 'author__email', 'device__number', 'problem_type')
    list_filter = ('priority', 'status', 'creation_date')
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'priority', 'location')
        }),
        ('Status and Assignment', {
            'fields': ('status', 'responsible', 'author')
        }),
        ('Device Information', {
            'fields': ('device_image', 'device', 'problem_type', 'reported_problems')
        }),
    )


@admin.register(Zone)
class ZoneAdmin(LeafletGeoAdmin):
    form = ZoneAdminForm
    list_display = ('name', 'description', 'city', 'region', 'neighborhood', 'zone_code', 'created_at')
    search_fields = ('name', 'zone_code', 'city', 'region', 'neighborhood')

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'location', 'zone_code', 'boundary_color')
        }),
        ('Additional Info', {
            'fields': ('city', 'region', 'neighborhood')
        }),
    )

@admin.register(MailHistory)
class MailHistoryAdmin(admin.ModelAdmin):
    list_display = ('subject', 'recipient_list', 'sent_at', 'success', 'error_message', 'view_html_message')
    list_filter = ('sent_at', 'success')
    search_fields = ('subject', 'recipient_list', 'error_message', 'html_message', 'plain_message')
    readonly_fields = ('html_message', 'plain_message')

    def view_html_message(self, obj):
        return format_html(
            '<a href="{}" target="_blank" style="background-color: #00599B; color: white; padding: 5px 15px; '
            'border-radius: 5px; text-decoration: none;">Ver e-mail</a>',
            obj.get_html_preview_url()
        )
    view_html_message.short_description = "Visualização"


@admin.register(AuditLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'action', 'get_user_display', 'content_type', 'object_repr')
    list_filter = ('action', 'content_type', 'timestamp', 'user')
    search_fields = ('object_repr', 'user__email')
    readonly_fields = ('timestamp', 'action', 'user', 'content_type', 'object_id', 'object_repr', 'changes')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_user_display(self, obj):
        return obj.get_user_display()

    get_user_display.short_description = 'Usuário'

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_add_button'] = False
        return super().changelist_view(request, extra_context)


# file: admin/reports.py
from django.contrib import admin
from django.db.models import Count, Sum, Avg, F
from django.db.models.functions import ExtractDay, Now
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import path

from .models import (
    Maintenance,
    ReportedProblem,
    OperationalCost,
    LightingDevice,
    Zone,
)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    change_list_template = 'admin/reports/report_dashboard.html'

    def get_report_view(self, request):
        context = {
            'title': 'Dashboard de Relatórios',
            **self.admin_site.each_context(request),
            'is_nav_sidebar_enabled': True,
            'has_permission': True,
            'available_apps': self.admin_site.get_app_list(request),
            'zones': Zone.objects.all(),
            'device_types': dict(LightingDevice.TYPE_CHOICES),
            'operational_status': dict(LightingDevice.STATUS_CHOICES),
            'priorities': dict(ServiceOrder.PRIORITY_CHOICES),
            'problem_status': dict(ReportedProblem.PROBLEM_STATUS_CHOICES),
            'cost_types': dict(OperationalCost.COST_TYPE_CHOICES),
        }
        return render(request, self.change_list_template, context)

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['zones'] = Zone.objects.all()
        return super().changelist_view(request, extra_context)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    def changelist_view(self, request, extra_context=None):
        return self.get_report_view(request)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('chart_data/<str:report_type>/', self.chart_data, name='report_chart_data'),
        ]
        return custom_urls + urls

    def get_devices_data(self, filters=None):
        queryset = LightingDevice.objects.all()
        if filters:
            if 'zone' in filters and filters['zone']:
                queryset = queryset.filter(zone__name=filters['zone'])
            if 'type' in filters and filters['type']:
                queryset = queryset.filter(type=filters['type'])
            if 'status' in filters and filters['status']:
                queryset = queryset.filter(operational_status=filters['status'])

        devices_by_zone = (
            queryset.values('zone__name', 'type')
            .annotate(count=Count('id'))
            .exclude(zone__isnull=True)
            .order_by('zone__name', 'type')
        )

        TYPE_CHOICES_DICT = dict(LightingDevice.TYPE_CHOICES)
        for device in devices_by_zone:
            device['type'] = TYPE_CHOICES_DICT.get(device['type'], device['type'])

        operational_status = (
            queryset.values('operational_status')
            .annotate(count=Count('id'))
            .order_by('operational_status')
        )

        return {
            'devicesByZone': {
                'labels': list(set([item['zone__name'] for item in devices_by_zone])),
                'datasets': [
                    {
                        'label': device_type,
                        'data': [next((item['count'] for item in devices_by_zone
                                       if item['zone__name'] == zone and item['type'] == device_type), 0)
                                 for zone in set([item['zone__name'] for item in devices_by_zone])]
                    }
                    for device_type in set([item['type'] for item in devices_by_zone])
                ]
            },
            'operationalStatus': {
                'labels': [item['operational_status'] for item in operational_status],
                'data': [item['count'] for item in operational_status]
            }
        }

    def get_maintenance_data(self, filters=None):
        queryset = Maintenance.objects.select_related('device')
        if filters:
            if 'zone' in filters and filters['zone']:
                queryset = queryset.filter(device__zone__name=filters['zone'])
            if 'date_from' in filters and filters['date_from']:
                queryset = queryset.filter(maintenance_date__gte=filters['date_from'])
            if 'date_to' in filters and filters['date_to']:
                queryset = queryset.filter(maintenance_date__lte=filters['date_to'])

        maintenance_frequency = (
            queryset.annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        return {
            'maintenanceFrequency': {
                'labels': [maintenance.device.__str__() for maintenance in maintenance_frequency],
                'data': [maintenance.count for maintenance in maintenance_frequency],
            }
        }

    def get_problems_data(self, filters=None):
        queryset = ReportedProblem.objects.all()
        if filters:
            if 'zone' in filters and filters['zone']:
                queryset = queryset.filter(device__zone__name=filters['zone'])
            if 'status' in filters and filters['status']:
                queryset = queryset.filter(status=filters['status'])
            if 'date_from' in filters and filters['date_from']:
                queryset = queryset.filter(report_date__date__gte=filters['date_from'])
            if 'date_to' in filters and filters['date_to']:
                queryset = queryset.filter(report_date__date__lte=filters['date_to'])

        total_problems = (
            queryset.values('device__zone__name')
            .annotate(
                total=Count('id'),
                resolved=Count('id', filter=models.Q(status='RESOLVIDO'))
            )
            .exclude(device__zone__isnull=True)
        )

        problems_by_type = (
            queryset.values('device__type', 'status')
            .annotate(count=Count('id'))
            .order_by('device__type', 'status')
        )

        device_types = dict(LightingDevice.TYPE_CHOICES)
        status_types = dict(ReportedProblem.PROBLEM_STATUS_CHOICES)

        processed_data = {}
        for problem in problems_by_type:
            device_type = device_types.get(problem['device__type'], problem['device__type'])
            if device_type not in processed_data:
                processed_data[device_type] = {status: 0 for status in status_types.values()}
            processed_data[device_type][status_types[problem['status']]] = problem['count']

        problem_origins = (
            queryset.values('origin')
            .annotate(count=Count('id'))
            .order_by('origin')
        )

        device_problems = (
            queryset.values('device__type')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        return {
            'problemResolution': {
                'labels': [item['device__zone__name'] for item in total_problems],
                'data': [
                    round((item['resolved'] / item['total']) * 100, 2)
                    if item['total'] > 0 else 0
                    for item in total_problems
                ]
            },
            'problemsOverview': {
                'labels': list(processed_data.keys()),
                'datasets': [
                    {
                        'label': status,
                        'data': [processed_data[device_type][status] for device_type in processed_data.keys()]
                    }
                    for status in status_types.values()
                ]
            },
            'problemOrigins': {
                'labels': [dict(ReportedProblem.ORIGIN_CHOICES)[origin] for origin in
                           problem_origins.values_list('origin', flat=True)],
                'data': [item['count'] for item in problem_origins]
            },
            'deviceProblems': {
                'labels': [dict(LightingDevice.TYPE_CHOICES)[item['device__type']] for item in device_problems],
                'data': [item['count'] for item in device_problems]
            }
        }

    def get_service_orders_data(self, filters=None):
        queryset = ServiceOrder.objects.filter(status='CONCLUIDA')
        if filters:
            if 'zone' in filters and filters['zone']:
                queryset = queryset.filter(device__zone__name=filters['zone'])
            if 'priority' in filters and filters['priority']:
                queryset = queryset.filter(priority=filters['priority'])
            if 'date_from' in filters and filters['date_from']:
                queryset = queryset.filter(creation_date__date__gte=filters['date_from'])
            if 'date_to' in filters and filters['date_to']:
                queryset = queryset.filter(creation_date__date__lte=filters['date_to'])

        completed_orders = (
            queryset.values('priority')
            .annotate(
                avg_time=Avg(
                    ExpressionWrapper(
                        F('updated_at') - F('creation_date'),
                        output_field=fields.DurationField()
                    )
                )
            )
        )

        return {
            'completionTime': {
                'labels': [item['priority'] for item in completed_orders],
                'data': [item['avg_time'].total_seconds() / 3600 for item in completed_orders]
            }
        }

    def get_financial_data(self, filters=None):
        queryset = OperationalCost.objects.all()
        if filters:
            if 'zone' in filters and filters['zone']:
                queryset = queryset.filter(device__zone__name=filters['zone'])
            if 'cost_type' in filters and filters['cost_type']:
                queryset = queryset.filter(cost_type=filters['cost_type'])
            if 'date_from' in filters and filters['date_from']:
                queryset = queryset.filter(date__gte=filters['date_from'])
            if 'date_to' in filters and filters['date_to']:
                queryset = queryset.filter(date__lte=filters['date_to'])

        costs_by_zone = (
            queryset.values('device__zone__name')
            .annotate(total_cost=Sum('value'))
            .exclude(device__zone__isnull=True)
            .order_by('-total_cost')
        )

        return {
            'costsByZone': {
                'labels': [item['device__zone__name'] for item in costs_by_zone],
                'data': [float(item['total_cost']) for item in costs_by_zone]
            }
        }

    def get_geographical_data(self):
        # Mapeamento de problemas por zona
        problems_by_zone = (
            ReportedProblem.objects.values('device__zone__name')
            .annotate(count=Count('id'))
            .exclude(device__zone__isnull=True)
            .order_by('-count')
        )

        return {
            'problemsByZone': {
                'labels': [item['device__zone__name'] for item in problems_by_zone],
                'data': [item['count'] for item in problems_by_zone]
            }
        }

    def get_users_data(self):
        # Análise de problemas reportados por usuário
        problems_by_user = (
            ReportedProblem.objects.values('user__email')
            .annotate(count=Count('id'))
            .exclude(user__isnull=True)
            .order_by('-count')[:10]
        )

        return {
            'problemsByUser': {
                'labels': [item['user__email'] for item in problems_by_user],
                'data': [item['count'] for item in problems_by_user]
            }
        }

    def chart_data(self, request, report_type):
        filters = {
            'zone': request.GET.get('zone'),
            'type': request.GET.get('type'),
            'status': request.GET.get('status'),
            'date_from': request.GET.get('date_from'),
            'date_to': request.GET.get('date_to'),
            'priority': request.GET.get('priority'),
            'cost_type': request.GET.get('cost_type'),
        }
        filters = {k: v for k, v in filters.items() if v}

        data_functions = {
            'devices': lambda: self.get_devices_data(filters),
            'maintenance': lambda: self.get_maintenance_data(filters),
            'problems': lambda: self.get_problems_data(filters),
            'service_orders': lambda: self.get_service_orders_data(filters),
            'financial': lambda: self.get_financial_data(filters),
            'geographical': lambda: self.get_geographical_data(),
            'users': lambda: self.get_users_data(),
        }

        if report_type in data_functions:
            return JsonResponse(data_functions[report_type]())

        return JsonResponse({'error': 'Invalid report type'}, status=400)