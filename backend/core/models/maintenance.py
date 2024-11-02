from django.db import models

from accounts.models import CustomUser
from core.models import LightingDevice


class Maintenance(models.Model):
    device = models.ForeignKey(LightingDevice, on_delete=models.CASCADE, related_name='maintenances', verbose_name='Dispositivo')
    maintenance_date = models.DateField(verbose_name='Data de Manutenção')
    description = models.TextField(verbose_name='Descrição')
    responsible_technician = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='maintenances', verbose_name='Técnico Responsável')
    cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Custo')

    class Meta:
        verbose_name = 'Manutenção'
        verbose_name_plural = 'Manutenções'