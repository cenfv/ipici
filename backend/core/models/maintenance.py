from django.db import models

from accounts.models import CustomUser
from core.models import LightingDevice
from core.models.service_order import ServiceOrder
from core.models.operational_cost import OperationalCost

class Maintenance(models.Model):
    device = models.ForeignKey(LightingDevice, on_delete=models.CASCADE, related_name='maintenances', verbose_name='Dispositivo')
    maintenance_date = models.DateField(verbose_name='Data de Manutenção')
    description = models.TextField(verbose_name='Descrição')
    responsible_technician = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='maintenances', verbose_name='Técnico Responsável')
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.SET_NULL, null=True, related_name='maintenances', verbose_name='Ordem de Serviço')
    operational_cost = models.OneToOneField(OperationalCost, on_delete=models.CASCADE, related_name='maintenance', verbose_name='Custo Operacional')

    def save(self, *args, **kwargs):
        if self.service_order:
            self.service_order.status = 'CONCLUIDA'
            self.service_order.save()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Manutenção'
        verbose_name_plural = 'Manutenções'