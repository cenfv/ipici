from rest_framework import serializers

from accounts.models import CustomUser
from core.models import LightingDevice, Zone, Address, ReportedProblem, ServiceOrder, Maintenance, OperationalCost


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


class ServiceOrderSerializer(serializers.ModelSerializer):
    responsible = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        required=False,
        allow_null=True
    )
    author = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        required=False,
        allow_null=True
    )
    device = serializers.PrimaryKeyRelatedField(
        queryset=LightingDevice.objects.all()
    )
    reported_problems = serializers.PrimaryKeyRelatedField(
        queryset=ReportedProblem.objects.all(),
        many=True,
        required=False
    )
    device_details = LightingDeviceSerializer(source='device', read_only=True)
    responsible_details = CustomUserSerializer(source='responsible', read_only=True)
    author_details = CustomUserSerializer(source='author', read_only=True)

    class Meta:
        model = ServiceOrder
        fields = [
            'id',
            'title',
            'description',
            'creation_date',
            'priority',
            'location',
            'status',
            'responsible',
            'author',
            'device',
            'problem_type',
            'reported_problems',
            'device_image',
            'device_details',
            'responsible_details',
            'author_details'
        ]
        read_only_fields = ['creation_date']

    def create(self, validated_data):
        reported_problems = validated_data.pop('reported_problems', [])
        service_order = ServiceOrder.objects.create(**validated_data)

        if reported_problems:
            service_order.reported_problems.set(reported_problems)

        return service_order

    def update(self, instance, validated_data):
        reported_problems = validated_data.pop('reported_problems', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if reported_problems is not None:
            instance.reported_problems.set(reported_problems)

        return instance


class OperationalCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationalCost
        fields = '__all__'
        read_only_fields = ['id']


class MaintenanceSerializer(serializers.ModelSerializer):
    operational_cost = OperationalCostSerializer(read_only=True)
    cost_type = serializers.ChoiceField(choices=OperationalCost.COST_TYPE_CHOICES, write_only=True, required=True)
    value = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=True)

    class Meta:
        model = Maintenance
        fields = '__all__'
        read_only_fields = ['id', 'operational_cost']

    def create(self, validated_data):
        cost_type = validated_data.pop('cost_type')
        value = validated_data.pop('value')

        operational_cost = OperationalCost.objects.create(
            device=validated_data['device'],
            cost_type=cost_type,
            value=value,
            date=validated_data['maintenance_date'],
            description=f"Custo associado à manutenção: {validated_data['description']}"
        )

        validated_data['operational_cost'] = operational_cost

        maintenance = Maintenance.objects.create(**validated_data)

        service_order = validated_data.get('service_order')
        if service_order:
            service_order.status = 'CONCLUIDA'
            service_order.save()

        return maintenance

    def update(self, instance, validated_data):
        cost_type = validated_data.pop('cost_type', None)
        value = validated_data.pop('value', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if cost_type or value:
            operational_cost = instance.operational_cost
            if cost_type:
                operational_cost.cost_type = cost_type
            if value:
                operational_cost.value = value
            operational_cost.save()

        return instance