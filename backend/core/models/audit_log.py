from django.db import models

from accounts.models import CustomUser


class AuditLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='audit_logs', verbose_name='Usuário')
    action = models.CharField(max_length=255, verbose_name='Ação')
    description = models.TextField(verbose_name='Descrição')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Data e Hora')

    class Meta:
        verbose_name = 'Log de Auditoria'
        verbose_name_plural = 'Logs de Auditoria'