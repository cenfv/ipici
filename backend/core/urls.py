from django.conf import settings
from django.conf.urls.static import static
from django.urls import path 
from core import views

app_name = "core"

urlpatterns = [
  path('view-html-message/<int:pk>/', views.view_html_message, name='view_html_message'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
