from django.urls import path
from django.contrib import admin
from . import views

app_name = "maps"

urlpatterns = [
    path('admin/map/', admin.site.admin_view(views.map_view), name='map_view'),
    path('get-zone-geometry/<int:zone_id>/', views.get_zone_geometry, name='get_zone_geometry'),

]
