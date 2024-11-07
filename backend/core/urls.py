from django.conf import settings
from django.conf.urls.static import static
from django.urls import path 
from core import views
from django.contrib.auth import views as auth_views
from core.views import CustomPasswordResetConfirmView, PasswordResetCompleteView



app_name = "core"

urlpatterns = [
  path('view-html-message/<int:pk>/', views.view_html_message, name='view_html_message'),
  path('user/reset/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
  path('user/reset/complete/', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
