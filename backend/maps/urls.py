from django.urls import path
from django.contrib import admin
from . import views

app_name = "maps"

urlpatterns = [
    path('devices', admin.site.admin_view(views.device_map_view), name='device_map_view'),
    path('service-order', admin.site.admin_view(views.service_order_map_view), name='service_order_map_view'),
    path('get-zone-geometry/<int:zone_id>/', views.get_zone_geometry, name='get_zone_geometry'),

]
