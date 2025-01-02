from django.db import models
from django.contrib.gis.db.models import PointField

from core.models.address import Address
from core.models.zone import Zone


class LightingDevice(models.Model):
    TYPE_CHOICES = [
        ('POSTE', 'Poste de Iluminação'),
        ('BRAÇO', 'Braço de Iluminação'),
        ('LUMINARIA_LED', 'Luminária LED'),
        ('LUMINARIA_HALOGENA', 'Luminária Halógena'),
        ('LUMINARIA_FLUORESCENTE', 'Luminária Fluorescente'),
        ('LUMINARIA_VAPOR_SODIO', 'Luminária Vapor de Sódio'),
        ('LUMINARIA_VAPOR_METALICO', 'Luminária Vapor Metálico'),
        ('LUMINARIA_INDUCAO', 'Luminária de Indução'),
        ('LUMINARIA_SOLAR', 'Luminária Solar'),
        ('PROJETOR', 'Projetor de Iluminação'),
        ('ILUMINACAO_DE_EMERGENCIA', 'Iluminação de Emergência'),
        ('ILUMINACAO_DECORATIVA', 'Iluminação Decorativa'),
        ('ILUMINACAO_VIAL', 'Iluminação Vial'),
        ('ILUMINACAO_PEDESTRE', 'Iluminação para Pedestres'),
        ('ILUMINACAO_CICLOVIA', 'Iluminação de Ciclovia'),
        ('REFLETOR', 'Refletor de Alta Intensidade'),
        ('OUTRO', 'Outro')
    ]
    STATUS_CHOICES = [
        ('OPERACIONAL', 'Operacional'),
        ('MANUTENCAO', 'Em Manutenção'),
        ('FALHA', 'Falha Detectada'),
        ('DESATIVADO', 'Desativado'),
        ('INDISPONIVEL', 'Indisponível Temporariamente'),
        ('PENDENTE_ATIVACAO', 'Pendente de Ativação')

    ]
    code = models.CharField(max_length=50, unique=True, verbose_name='Código de identificação')
    owner = models.CharField(max_length=100, verbose_name='Proprietário')
    structural_name = models.CharField(max_length=100, verbose_name='Denominação Estrutural', blank=True, null=True)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name='Tipo')
    height = models.FloatField(verbose_name='Altura')
    material = models.CharField(max_length=100, verbose_name='Material')
    installation_date = models.DateField(verbose_name='Data de Instalação')
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='devices', verbose_name='Endereço')
    location = PointField(verbose_name='Localização')
    device_image = models.ImageField(upload_to='devices/', blank=True, null=True, verbose_name='Imagem do dispositivo')
    operational_status = models.CharField(max_length=50, choices=STATUS_CHOICES, verbose_name='Status Operacional')
    qr_code = models.CharField(max_length=100, unique=True, verbose_name='Código QR', blank=True, null=True)
    energy_source = models.CharField(max_length=100, verbose_name='Fonte de Energia', blank=True, null=True)
    additional_features = models.TextField(blank=True, null=True, verbose_name='Recursos Adicionais')
    nearby_installations = models.TextField(blank=True, null=True, verbose_name='Instalações Próximas')
    last_maintenance_date = models.DateField(null=True, blank=True, verbose_name='Data da Última Manutenção')
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, related_name='devices', verbose_name='Zona')

    class Meta:
        verbose_name = 'Dispositivo'
        verbose_name_plural = 'Dispositivos'

    def __str__(self):
        return f"{self.type} - {self.code}"
