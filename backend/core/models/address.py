from django.db import models


class Address(models.Model):
    street = models.CharField(max_length=255, verbose_name='Rua')
    number = models.CharField(max_length=20, verbose_name='Número')
    neighborhood = models.CharField(max_length=100, verbose_name='Bairro')
    complement = models.CharField(max_length=100, blank=True, null=True, verbose_name='Complemento')
    city = models.CharField(max_length=100, verbose_name='Cidade')
    state = models.CharField(max_length=100, verbose_name='Estado')
    country = models.ForeignKey('Country', on_delete=models.CASCADE, related_name='addresses', verbose_name='País')
    zip_code = models.CharField(max_length=20, verbose_name='CEP')

    class Meta:
        verbose_name = 'Endereço'
        verbose_name_plural = 'Endereços'

    def __str__(self):
        return f"{self.street}, {self.number} - {self.city}, {self.state}, {self.country}"
