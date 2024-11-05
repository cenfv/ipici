from urllib.parse import urljoin
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from accounts.models import CustomUser
from rest_framework import status, viewsets
from rest_framework.generics import GenericAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import CustomUserSerializer, LightingDeviceSerializer, PasswordResetRequestSerializer, \
    SetPasswordSerializer
from core.mailers.user_account_mailer import PasswordResetMailer
from core.models import LightingDevice


class UserListCreateView(ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

class UserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

class LightingDeviceListView(APIView):
    def get(self, request):
        devices = LightingDevice.objects.all()
        serializer = LightingDeviceSerializer(devices, many=True)
        return Response(serializer.data)

class LightingDeviceDetailView(APIView):
    def get(self, request, pk):
        try:
            device = LightingDevice.objects.get(pk=pk)
        except LightingDevice.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LightingDeviceSerializer(device)
        return Response(serializer.data)

class PasswordResetRequestView(GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email'].lower()
            user = get_user_model().objects.filter(email=email).first()
            if user:
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = "/reset-password/" + uid + "/" + token + "/"
                reset_link = urljoin(settings.PORTAL_URL, reset_url)

                password_reset_mailer = PasswordResetMailer([email], reset_link)
                password_reset_mailer.send()
            return Response(
                {"message": "Se o email estiver registrado, você receberá um link para redefinir sua senha."},
                status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(GenericAPIView):
    serializer_class = SetPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request, uidb64=None, token=None, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({"error": "Token inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Senha redefinida com sucesso."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetTokenValidationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64=None, token=None, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({"valid": False}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            return Response({"valid": True}, status=status.HTTP_200_OK)
        else:
            return Response({"valid": False}, status=status.HTTP_400_BAD_REQUEST)
