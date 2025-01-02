from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.serializers.json import DjangoJSONEncoder
from django.conf import settings

class MailHistory(models.Model):
    subject = models.CharField(max_length=255, verbose_name='Assunto')
    recipient_list = models.TextField(verbose_name='Destinatários')
    html_message = models.TextField(verbose_name='Mensagem', null=True, blank=True)
    plain_message = models.TextField(verbose_name='Mensagem (Texto)', null=True, blank=True)
    sent_at = models.DateTimeField(default=timezone.now, verbose_name='Enviado em')
    success = models.BooleanField(default=False, verbose_name='Enviado com Sucesso')
    error_message = models.TextField(null=True, blank=True, verbose_name='Mensagem de Erro')

    def __str__(self):
        return f"Mail to {self.recipient_list} - {self.subject} - {self.sent_at}"

    def get_html_preview_url(self):
        return reverse('core:view_html_message', args=[self.pk])

    class Meta:
        verbose_name = 'Histórico de E-mail'
        verbose_name_plural = 'Histórico de E-mails'

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Criação'),
        ('UPDATE', 'Atualização'),
        ('DELETE', 'Exclusão'),
    ]

    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Data/Hora')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, verbose_name='Ação')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Usuário'
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        verbose_name='Tipo de Conteúdo'
    )
    object_id = models.CharField(max_length=255, verbose_name='ID do Objeto')
    content_object = GenericForeignKey('content_type', 'object_id')

    object_repr = models.CharField(max_length=255, verbose_name='Representação do Objeto')
    changes = models.JSONField(encoder=DjangoJSONEncoder, null=True, verbose_name='Alterações')

    class Meta:
        verbose_name = 'Log do Sistema'
        verbose_name_plural = 'Logs do Sistema'
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.get_action_display()} em {self.object_repr} por {self.get_user_display()}'

    def get_user_display(self):
        return self.user if self.user else 'SISTEMA'
