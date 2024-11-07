from rest_framework import serializers

from accounts.models import CustomUser
from core.models import LightingDevice, Zone, Address, ReportedProblem


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
    address = AddressSerializer(required=False)

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'birth_date', 'phone', 'address']
        extra_kwargs = {'role': {'required': True}}

    def create(self, validated_data):
        address_data = validated_data.pop('address', None)

        user = CustomUser.objects.create_user(password=None, role=CustomUser.RoleChoices.REGULAR_USER, **validated_data)

        if address_data:
            address = Address.objects.create(**address_data)
            user.address = address
            user.save()

        return user

    def update(self, instance, validated_data):
        address_data = validated_data.pop('address', None)
        if address_data:
            if instance.address:
                for key, value in address_data.items():
                    setattr(instance.address, key, value)
                instance.address.save()
            else:
                instance.address = Address.objects.create(**address_data)

        return super().update(instance, validated_data)

class ReportedProblemSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)
    device = serializers.PrimaryKeyRelatedField(queryset=LightingDevice.objects.all())

    class Meta:
        model = ReportedProblem
        fields = ['id', 'user', 'device', 'description', 'report_date', 'image', 'status']
        read_only_fields = ['report_date', 'user']

    def create(self, validated_data):
        device = validated_data.get('device')
        validated_data['device'] = device
        return super().create(validated_data)

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



