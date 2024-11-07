from django.urls import include, path
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import (SpectacularAPIView, SpectacularRedocView,
                                   SpectacularSwaggerView)
from rest_framework_simplejwt.views import TokenObtainPairView,TokenVerifyView

from api.views import UserListCreateView, PasswordResetRequestView, PasswordResetTokenValidationView, \
    PasswordResetConfirmView, LightingDeviceListView, LightingDeviceDetailView, UserDetailView, UserMeView

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('auth/verify/', TokenVerifyView.as_view(), name='auth_verify'),
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('user/password_reset_request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('user/reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('user/reset/<uidb64>/<token>/validate/', PasswordResetTokenValidationView.as_view(),
         name='password_reset_token_validate'),

    path('devices/', LightingDeviceListView.as_view(), name='lightingdevice-list'),
    path('devices/<int:pk>/', LightingDeviceDetailView.as_view(), name='lightingdevice-detail'),

    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]