from django.contrib.gis.db.models import PolygonField
from django.db import models

class Zone(models.Model):
    name = models.CharField(max_length=100, verbose_name='Nome')
    description = models.TextField(blank=True, null=True, verbose_name='Descrição')
    location = PolygonField(verbose_name='Área Geográfica')
    city = models.CharField(max_length=100, verbose_name='Cidade', blank=True, null=True)
    region = models.CharField(max_length=100, verbose_name='Região', blank=True, null=True)
    neighborhood = models.CharField(max_length=100, verbose_name='Bairro', blank=True, null=True)
    zone_code = models.CharField(max_length=50, unique=True, verbose_name='Código da Zona')
    device_count = models.IntegerField(default=0, verbose_name='Quantidade de Dispositivos')
    problem_count = models.IntegerField(default=0, verbose_name='Quantidade de Problemas Reportados')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")

    class Meta:
        verbose_name = 'Zona'
        verbose_name_plural = 'Zonas'

    def __str__(self):
        return f'{self.name} - {self.city or "Cidade Desconhecida"}'
