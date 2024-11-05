from django.contrib import admin
from django.contrib.auth.models import Group
from django.utils.html import format_html

from .forms import ZoneAdminForm
from .models import (
    AuditLog, Country, LightingDevice, Maintenance,
    OperationalCost, ReportedProblem, Sensor, ServiceOrder, Zone, MailHistory, Address
)
from leaflet.admin import LeafletGeoAdmin

try:
    from rest_framework.authtoken.models import TokenProxy as DRFToken
except ImportError:
    from rest_framework.authtoken.models import Token as DRFToken

admin.site.unregister(Group)
admin.site.unregister(DRFToken)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'description', 'timestamp')
    search_fields = ('user__email', 'action', 'description')
    list_filter = ('action', 'timestamp')


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
    list_display = ('device', 'maintenance_date', 'description', 'responsible_technician', 'cost')
    search_fields = ('device__number', 'responsible_technician__email', 'description')
    list_filter = ('maintenance_date', 'responsible_technician')


@admin.register(OperationalCost)
class OperationalCostAdmin(admin.ModelAdmin):
    list_display = ('device', 'cost_type', 'value', 'date', 'description')
    search_fields = ('device__number', 'cost_type', 'description')
    list_filter = ('cost_type', 'date')


@admin.register(ReportedProblem)
class ReportedProblemAdmin(admin.ModelAdmin):
    list_display = ('user', 'device', 'status', 'report_date', 'description', 'image')
    search_fields = ('user__email', 'device__number', 'status', 'description')
    list_filter = ('status', 'report_date')


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
    list_display = ('number', 'owner', 'structural_name', 'type', 'height', 'material', 'installation_date', 'operational_status', 'qr_code', 'energy_source', 'zone', 'address')
    search_fields = ('number', 'owner', 'structural_name', 'qr_code', 'energy_source')
    list_filter = ('type', 'operational_status', 'zone', 'address')
    inlines = [MaintenanceInline, OperationalCostInline, SensorInline]
    fieldsets = (
        (None, {
            'fields': ('number', 'owner', 'structural_name', 'type', 'height', 'material', 'installation_date','address', 'zone', 'location')
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
    list_display = ('title', 'priority', 'status', 'responsible', 'author', 'creation_date', 'origin', 'problem_type', 'device')
    search_fields = ('title', 'description', 'responsible__email', 'author__email', 'device__number', 'problem_type')
    list_filter = ('priority', 'status', 'origin', 'creation_date')
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'priority', 'location')
        }),
        ('Status and Assignment', {
            'fields': ('status', 'responsible', 'author')
        }),
        ('Device Information', {
            'fields': ('device_image', 'device', 'problem_type', 'origin', 'reported_problems')
        }),
    )


@admin.register(Zone)
class ZoneAdmin(LeafletGeoAdmin):
    form = ZoneAdminForm
    list_display = ('name', 'description', 'city', 'region', 'neighborhood', 'zone_code', 'device_count', 'problem_count', 'created_at')
    search_fields = ('name', 'zone_code', 'city', 'region', 'neighborhood')

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'location', 'zone_code', 'boundary_color')
        }),
        ('Statistics', {
            'fields': ('device_count', 'problem_count')
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
