import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
import os

from core.models.mail_history import MailHistory

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def send_mail(subject, template_name, context, recipient_list):
        email_html_message = None
        email_plain_message = None
        try:
            email_html_message = render_to_string(template_name, context)
            plain_text_template_name = EmailService._get_text_template_path(template_name)

            try:
                email_plain_message = render_to_string(plain_text_template_name, context)
            except Exception as e:
                logger.error(f"Error occurred while rendering plain text template: {str(e)}", exc_info=True)
                email_plain_message = None

            send_mail(
                subject,
                email_plain_message,
                None,
                recipient_list,
                fail_silently=False,
                html_message=email_html_message
            )
            logger.info(f"Email successfully sent to {recipient_list}")
            EmailService._log_mail_history(subject, recipient_list, email_html_message, email_plain_message, True, None)

        except Exception as e:
            logger.error(f"Error occurred while sending mail: {str(e)}", exc_info=True)
            EmailService._log_mail_history(subject, recipient_list, email_html_message, email_plain_message, False, str(e))

    @staticmethod
    def _get_text_template_path(template_name):
        base_dir, filename = os.path.split(template_name)
        text_template_dir = os.path.join(base_dir, 'plain_text')
        text_template_name = filename.replace('.html', '.txt')
        return os.path.join(text_template_dir, text_template_name)

    @staticmethod
    def _log_mail_history(subject, recipient_list, html_message, plain_message, success, error_message):
        mail_history = MailHistory(
            subject=subject,
            recipient_list=", ".join(recipient_list),
            html_message=html_message,
            plain_message=plain_message,
            success=success,
            error_message=error_message
        )
        mail_history.save()
