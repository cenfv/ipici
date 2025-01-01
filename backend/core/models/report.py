from django.db import models


class Report(models.Model):

    class Meta:
        verbose_name = 'Relatório'
        verbose_name_plural = 'Relatórios'
        managed = False
        default_permissions = ()

    def __str__(self):
        return 'Relatórios'