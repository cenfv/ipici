from django.db import models

from accounts.models import CustomUser
from core.models import LightingDevice


class ReportedProblem(models.Model):
    PROBLEM_STATUS_CHOICES = [
        ('RELATADO', 'Relatado'),
        ('EM_ANALISE', 'Em Análise'),
        ('RESOLVIDO', 'Resolvido'),
    ]
    ORIGIN_CHOICES = [
        ('CIDADAO', 'Cidadão'),
        ('SENSOR', 'Sensor'),
        ('ADMINISTRADOR', 'Administrador'),
        ('FUNCIONARIO', 'Funcionário'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reported_problems', verbose_name='Usuário', null=True)
    origin = models.CharField(max_length=15, choices=ORIGIN_CHOICES, verbose_name='Origem', default='CIDADAO')
    device = models.ForeignKey(LightingDevice, on_delete=models.CASCADE, related_name='problems', verbose_name='Dispositivo')
    description = models.TextField(verbose_name='Descrição')
    report_date = models.DateTimeField(auto_now_add=True, verbose_name='Data do Relato')
    image = models.ImageField(upload_to='problems/', blank=True, null=True, verbose_name='Imagem')
    status = models.CharField(max_length=15, choices=PROBLEM_STATUS_CHOICES, verbose_name='Status')

    class Meta:
        verbose_name = 'Problema Relatado'
        verbose_name_plural = 'Problemas Relatados'