from django.db import models

class MapDummy(models.Model):
    class Meta:
        verbose_name = "Mapa"
        verbose_name_plural = "Mapas"
        managed = False