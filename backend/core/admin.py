from django.contrib import admin
from django.contrib.auth.models import Group
from .models import (
    AuditLog, Country, LightingDevice, Maintenance,
    OperationalCost, ReportedProblem, Sensor, ServiceOrder, Zone
)

try:
    from rest_framework.authtoken.models import TokenProxy as DRFToken
except ImportError:
    from rest_framework.authtoken.models import Token as DRFToken

admin.site.unregister(Group)
admin.site.unregister(DRFToken)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp')
    search_fields = ('user__first_name', 'action')
    list_filter = ('action', 'timestamp')


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')


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


class ServiceOrderInline(admin.TabularInline):
    model = ServiceOrder
    extra = 1


@admin.register(LightingDevice)
class LightingDeviceAdmin(admin.ModelAdmin):
    list_display = ('number', 'owner', 'type', 'operational_status', 'zone')
    search_fields = ('number', 'owner', 'qr_code')
    list_filter = ('type', 'operational_status', 'zone')
    inlines = [MaintenanceInline, OperationalCostInline, ReportedProblemInline, SensorInline, ServiceOrderInline]
    fieldsets = (
        (None, {
            'fields': ('number', 'owner', 'structural_name', 'type', 'height', 'material', 'installation_date', 'location')
        }),
        ('Operational Info', {
            'fields': ('operational_status', 'qr_code', 'energy_source', 'last_maintenance_date')
        }),
        ('Additional Info', {
            'fields': ('additional_features', 'nearby_installations', 'zone')
        }),
    )


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('device', 'maintenance_date', 'responsible_technician', 'cost')
    search_fields = ('device__number', 'responsible_technician__first_name')
    list_filter = ('maintenance_date',)


@admin.register(OperationalCost)
class OperationalCostAdmin(admin.ModelAdmin):
    list_display = ('device', 'cost_type', 'value', 'date')
    search_fields = ('device__number', 'cost_type')
    list_filter = ('cost_type', 'date')


@admin.register(ReportedProblem)
class ReportedProblemAdmin(admin.ModelAdmin):
    list_display = ('user', 'device', 'status', 'report_date')
    search_fields = ('user__first_name', 'device__number', 'status')
    list_filter = ('status', 'report_date')


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('device', 'sensor_status', 'last_report_date', 'battery_level')
    search_fields = ('device__number', 'sensor_status')
    list_filter = ('sensor_status', 'connection_type')


@admin.register(ServiceOrder)
class ServiceOrderAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'status', 'creation_date', 'responsible')
    search_fields = ('title', 'responsible__first_name', 'author__first_name')
    list_filter = ('priority', 'status', 'origin')
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'creation_date', 'priority', 'location')
        }),
        ('Status and Assignment', {
            'fields': ('status', 'responsible', 'author')
        }),
        ('Device Information', {
            'fields': ('device_image', 'device', 'problem_type', 'origin')
        }),
    )


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
