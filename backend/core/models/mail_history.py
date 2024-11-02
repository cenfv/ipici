from django.db import models
from django.urls import reverse
from django.utils import timezone


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