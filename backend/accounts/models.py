from urllib.parse import urljoin
from django.conf import settings
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager,
                                        PermissionsMixin)
from django.contrib.auth.tokens import default_token_generator
from django.db import models
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from core.mailers.user_account_mailer import WelcomeMailer
from core.models.country import Country


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, birth_date=None, **extra_fields):
        if not email:
            raise ValueError('O endereço de e-mail deve ser fornecido')
        if not birth_date:
            raise ValueError('A data de nascimento deve ser fornecida')

        email = self.normalize_email(email)
        user = self.model(email=email, birth_date=birth_date, **extra_fields)
        user.set_password(password) if password else user.set_unusable_password()
        user.save(using=self._db)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = "/reset-password/" + uid + "/" + token + "/"
        reset_link = urljoin(settings.PORTAL_URL, reset_url)

        welcome_mailer = WelcomeMailer([email], reset_link)
        welcome_mailer.send()

        return user


    def create_superuser(self, email, password=None, birth_date=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser deve ter is_superuser=True.')

        return self.create_user(email, password, birth_date=birth_date, **extra_fields)

# class UserInfo(models.Model):
#     specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE, related_name='user_specialty', verbose_name='Especialidade')
#
#     class Meta:
#         verbose_name = 'Informação do Usuário'
#         verbose_name_plural = 'Informações dos Usuários'
#         db_table = 'accounts_user_info'
#
#     def __str__(self):
#         return self.specialty.name

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, verbose_name='e-mail')
    first_name = models.CharField(max_length=30, blank=True, verbose_name='Nome')
    last_name = models.CharField(max_length=30, blank=True, verbose_name='Sobrenome')
    nationality = models.CharField(max_length=100, verbose_name='Nacionalidade')
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='user_country', verbose_name='País')
    locality = models.CharField(max_length=100, verbose_name='Localidade')
    phone = models.CharField(max_length=100, verbose_name='Telefone')
    birth_date = models.DateField(max_length=100, verbose_name='Data de Nascimento')
    # user_info = models.OneToOneField(UserInfo, on_delete=models.CASCADE, related_name='user_info', verbose_name='Informações do Usuário', null=True, blank=True)

    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    is_staff = models.BooleanField(default=False, verbose_name='Usuário Interno')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Data criação')
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        db_table = 'accounts_user'

    def get_full_name(self):
        if self.first_name:
            return f'{self.first_name} {self.last_name}'
        return self.email

    @property
    def full_name(self):
        return self.get_full_name()
