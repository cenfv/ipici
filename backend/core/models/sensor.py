from django.db import models

from core.models import LightingDevice


class Sensor(models.Model):
    CONNECTION_TYPE_CHOICES = [
        ('WIFI', 'Wi-Fi'),
        ('LORAWAN', 'LoRaWAN'),
        ('LORA_MESH', 'LoRa Mesh'),
    ]
    SENSOR_STATUS_CHOICES = [
        ('OPERACIONAL', 'Operacional'),
        ('FALHA_DETECTADA', 'Falha Detectada'),
        ('INATIVO', 'Inativo'),
    ]
    device = models.OneToOneField(LightingDevice, on_delete=models.CASCADE, related_name='sensor', verbose_name='Dispositivo')
    sensor_status = models.CharField(max_length=50, choices=SENSOR_STATUS_CHOICES, verbose_name='Status do Sensor')
    last_report_date = models.DateTimeField(verbose_name='Data do Último Relatório')
    connection_type = models.CharField(max_length=50, choices=CONNECTION_TYPE_CHOICES, verbose_name='Tipo de Conexão')
    firmware_version = models.CharField(max_length=50, verbose_name='Versão do Firmware')
    battery_level = models.FloatField(blank=True, null=True, verbose_name='Nível de Bateria')

    class Meta:
        verbose_name = 'Sensor'
        verbose_name_plural = 'Sensores'