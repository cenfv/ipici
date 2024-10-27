from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AbstractUser, Group, Permission

class Usuario(AbstractUser):
    TIPO_USUARIO_CHOICES = [
        ('TECNICO', 'Técnico'),
        ('ADMINISTRADOR', 'Administrador'),
        ('CIDADAO', 'Cidadão'),
    ]
    tipo_usuario = models.CharField(max_length=15, choices=TIPO_USUARIO_CHOICES)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    endereco = models.CharField(max_length=255, blank=True, null=True)
    imagem_perfil = models.ImageField(upload_to='perfil/', blank=True, null=True)

    groups = models.ManyToManyField(
        Group,
        related_name="usuario_set",
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="usuario_permissions_set",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

class Zona(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    coordenadas = models.TextField()

class DispositivoIluminacao(models.Model):
    TIPO_CHOICES = [
        ('LUMINARIA', 'Luminária'),
        ('POSTE', 'Poste'),
    ]
    STATUS_CHOICES = [
        ('OPERACIONAL', 'Operacional'),
        ('MANUTENCAO', 'Em Manutenção'),
        ('FALHA', 'Falha Detectada'),
    ]
    numero = models.CharField(max_length=50, unique=True)
    proprietario = models.CharField(max_length=100)
    denominacao_estrutural = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    altura = models.FloatField()
    material = models.CharField(max_length=100)
    data_instalacao = models.DateField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    status_operacional = models.CharField(max_length=50, choices=STATUS_CHOICES)
    codigo_qr = models.CharField(max_length=100, unique=True)
    fonte_energia = models.CharField(max_length=100)
    recursos_adicionais = models.TextField(blank=True, null=True)
    instalacoes_proximas = models.TextField(blank=True, null=True)
    data_ultima_manutencao = models.DateField(null=True, blank=True)
    zona = models.ForeignKey(Zona, on_delete=models.SET_NULL, null=True, related_name='dispositivos')

class Sensor(models.Model):
    TIPO_CONEXAO_CHOICES = [
        ('WIFI', 'Wi-Fi'),
        ('LORAWAN', 'LoRaWAN'),
        ('LORA_MESH', 'LoRa Mesh'),
    ]
    STATUS_SENSOR_CHOICES = [
        ('OPERACIONAL', 'Operacional'),
        ('FALHA_DETECTADA', 'Falha Detectada'),
        ('INATIVO', 'Inativo'),
    ]
    dispositivo = models.OneToOneField(DispositivoIluminacao, on_delete=models.CASCADE, related_name='sensor')
    status_sensor = models.CharField(max_length=50, choices=STATUS_SENSOR_CHOICES)
    data_ultimo_relatorio = models.DateTimeField()
    tipo_conexao = models.CharField(max_length=50, choices=TIPO_CONEXAO_CHOICES)
    versao_firmware = models.CharField(max_length=50)
    nivel_bateria = models.FloatField(blank=True, null=True)

class OrdemServico(models.Model):
    PRIORIDADE_CHOICES = [
        ('ALTA', 'Alta'),
        ('BAIXA', 'Baixa'),
    ]
    STATUS_CHOICES = [
        ('ABERTA', 'Aberta'),
        ('EM_ANDAMENTO', 'Em Andamento'),
        ('CONCLUIDA', 'Concluída'),
    ]
    ORIGEM_CHOICES = [
        ('CIDADAO', 'Cidadão'),
        ('SENSOR', 'Sensor'),
        ('ADMINISTRADOR', 'Administrador'),
    ]
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    prioridade = models.CharField(max_length=5, choices=PRIORIDADE_CHOICES)
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    responsavel = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='ordens_responsavel')
    autor = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='ordens_autor')
    imagem_dispositivo = models.ImageField(upload_to='ordens/', blank=True, null=True)
    dispositivo = models.ForeignKey(DispositivoIluminacao, on_delete=models.CASCADE, related_name='ordens_servico')
    tipo_problema = models.CharField(max_length=100)
    origem = models.CharField(max_length=15, choices=ORIGEM_CHOICES)

class Manutencao(models.Model):
    dispositivo = models.ForeignKey(DispositivoIluminacao, on_delete=models.CASCADE, related_name='manutencoes')
    data_manutencao = models.DateField()
    descricao = models.TextField()
    tecnico_responsavel = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='manutencoes')
    custo = models.DecimalField(max_digits=10, decimal_places=2)

class ProblemaRelatado(models.Model):
    STATUS_PROBLEMA_CHOICES = [
        ('RELATADO', 'Relatado'),
        ('EM_ANALISE', 'Em Análise'),
        ('RESOLVIDO', 'Resolvido'),
    ]
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='problemas_reportados')
    dispositivo = models.ForeignKey(DispositivoIluminacao, on_delete=models.CASCADE, related_name='problemas')
    descricao = models.TextField()
    data_relato = models.DateTimeField(auto_now_add=True)
    imagem = models.ImageField(upload_to='problemas/', blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_PROBLEMA_CHOICES)

class LogAuditoria(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='logs_auditoria')
    acao = models.CharField(max_length=255)
    descricao = models.TextField()
    data_hora = models.DateTimeField(auto_now_add=True)

class CustoOperacional(models.Model):
    TIPO_CUSTO_CHOICES = [
        ('INSTALACAO', 'Instalação'),
        ('MANUTENCAO', 'Manutenção'),
        ('OPERACIONAL', 'Operacional'),
    ]
    dispositivo = models.ForeignKey(DispositivoIluminacao, on_delete=models.CASCADE, related_name='custos')
    tipo_custo = models.CharField(max_length=15, choices=TIPO_CUSTO_CHOICES)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateField()
    descricao = models.TextField()
