from django.db import models

class Zone(models.Model):
    name = models.CharField(max_length=100, verbose_name='Nome')
    description = models.TextField(blank=True, null=True, verbose_name='Descrição')
    coordinates = models.TextField(verbose_name='Coordenadas')

    class Meta:
        verbose_name = 'Zona'
        verbose_name_plural = 'Zonas'
