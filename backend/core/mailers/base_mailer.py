from abc import ABC, abstractmethod
from django.conf import settings
from core.services.mail_service import EmailService


class BaseMailer(ABC):
    def __init__(self, recipient_list, subject, context=None):
        self.recipient_list = recipient_list
        self.subject = subject
        self.context = context or {}
        self.context.update(self.get_default_context())

    @property
    @abstractmethod
    def template_name(self):
        pass

    def send(self):
        EmailService.send_mail(
            self.subject,
            self.template_name,
            self.context,
            self.recipient_list
        )

    def get_default_context(self):
        return {
            'BASE_URL': settings.BASE_URL,
            'PORTAL_URL': settings.PORTAL_URL
        }
