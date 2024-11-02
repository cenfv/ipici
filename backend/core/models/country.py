from django.db import models


class Country(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='Nome do País')
    code = models.CharField(max_length=3, unique=True, verbose_name='Código do País')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'País'
        verbose_name_plural = 'Países'