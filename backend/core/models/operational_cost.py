from django.db import models

from core.models import LightingDevice


class OperationalCost(models.Model):
    COST_TYPE_CHOICES = [
        ('INSTALACAO', 'Instalação'),
        ('MANUTENCAO', 'Manutenção'),
        ('OPERACIONAL', 'Operacional'),
    ]
    device = models.ForeignKey(LightingDevice, on_delete=models.CASCADE, related_name='costs', verbose_name='Dispositivo')
    cost_type = models.CharField(max_length=15, choices=COST_TYPE_CHOICES, verbose_name='Tipo de Custo')
    value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Valor')
    date = models.DateField(verbose_name='Data')
    description = models.TextField(verbose_name='Descrição')

    class Meta:
        verbose_name = 'Custo Operacional'
        verbose_name_plural = 'Custos Operacionais'