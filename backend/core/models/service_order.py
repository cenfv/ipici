from django.db import models
from django.contrib.gis.db.models import PointField
from accounts.models import CustomUser
from core.models import LightingDevice
from core.models.reported_problem import ReportedProblem


class ServiceOrder(models.Model):
    PRIORITY_CHOICES = [
        ('ALTA', 'Alta'),
        ('MEDIA', 'Média'),
        ('BAIXA', 'Baixa'),
    ]
    STATUS_CHOICES = [
        ('ABERTA', 'Aberta'),
        ('EM_ANDAMENTO', 'Em Andamento'),
        ('CONCLUIDA', 'Concluída'),
    ]

    title = models.CharField(max_length=100, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    creation_date = models.DateTimeField(auto_now_add=True, verbose_name='Data de Criação')
    priority = models.CharField(max_length=5, choices=PRIORITY_CHOICES, verbose_name='Prioridade')
    location = PointField(verbose_name='Localização', )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, verbose_name='Status')
    responsible = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='service_orders_responsible', verbose_name='Responsável')
    author = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='service_orders_author', verbose_name='Autor')
    device_image = models.ImageField(upload_to='orders/', blank=True, null=True, verbose_name='Imagem do Dispositivo')
    device = models.ForeignKey(LightingDevice, on_delete=models.CASCADE, related_name='service_orders', verbose_name='Dispositivo')
    problem_type = models.CharField(max_length=100, verbose_name='Tipo de Problema')
    reported_problems = models.ManyToManyField(ReportedProblem, related_name='service_orders', verbose_name='Problemas Relatados', blank=True)

    class Meta:
        verbose_name = 'Ordem de Serviço'
        verbose_name_plural = 'Ordens de Serviço'