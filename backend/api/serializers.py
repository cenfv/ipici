from rest_framework import serializers

from accounts.models import CustomUser
from core.models import LightingDevice, Zone, Address


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['street', 'number', 'neighborhood', 'complement', 'city', 'state', 'country', 'zip_code']

class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = ['name', 'description', 'location', 'city', 'region', 'neighborhood', 'zone_code', 'boundary_color', 'device_count', 'problem_count', 'created_at', 'updated_at']

class LightingDeviceSerializer(serializers.ModelSerializer):
    address = AddressSerializer()
    zone = ZoneSerializer()

    class Meta:
        model = LightingDevice
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'birth_date'
        ]

    def create(self, validated_data):
        email = validated_data.pop('email')
        birth_date = validated_data.pop('birth_date')
        user_info = validated_data.pop('user_info', None)

        user = CustomUser.objects.create_user(
            email=email,
            birth_date=birth_date,
            user_info=user_info,
            **validated_data
        )

        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class SetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"message": "As senhas não coincidem."})
        return data

    def save(self, **kwargs):
        self.user.set_password(self.validated_data['new_password'])
        self.user.save()


