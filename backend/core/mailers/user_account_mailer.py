from core.mailers.base_mailer import BaseMailer


class PasswordResetMailer(BaseMailer):
    template_name = 'emails/user_password_reset.html'

    def __init__(self, recipient_list, reset_link):
        subject = 'IPICI - Redefinição de senha'
        context = {'reset_link': reset_link}
        super().__init__(recipient_list, subject, context)


class WelcomeMailer(BaseMailer):
    template_name = 'emails/new_user_welcome.html'

    def __init__(self, recipient_list, reset_link):
        subject = 'Seja bem-vindo(a) ao Metaverso!'
        context = {'reset_link': reset_link}
        super().__init__(recipient_list, subject, context)
