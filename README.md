# IPICI

**Iluminação Pública Inteligente para Cidades Inteligentes**

Sistema de gestão de iluminação pública urbana desenvolvido como Trabalho de Conclusão de
Curso do Bacharelado em Engenharia de Software da UTFPR, campus Cornélio Procópio.

O sistema mantém o cadastro georreferenciado dos dispositivos de iluminação de um município,
recebe relatos de falha da população, organiza o trabalho de campo em ordens de serviço,
registra as manutenções executadas e apura o custo operacional de cada dispositivo.

## Contexto

A iluminação pública convencional tem dois problemas recorrentes: a falha só é detectada
quando alguém percebe e comunica, e não existe registro estruturado de onde estão os
equipamentos, em que estado se encontram e quanto custam ao longo da vida útil. O resultado
é desperdício de energia, manutenção reativa e trechos de via sem iluminação por períodos
longos.

O IPICI ataca esse cenário por dois caminhos. O primeiro é a participação do cidadão: o
aplicativo permite relatar um poste apagado ou danificado apontando no mapa ou lendo o QR
Code afixado no equipamento, com foto e descrição. O segundo é a base de dados
georreferenciada: cada dispositivo tem localização, zona, histórico de manutenções e custos,
o que permite relatórios de incidência de problemas, tempo de atendimento e gasto por região.

A arquitetura foi preparada para receber sensores IoT acoplados aos dispositivos, mas a
integração com sensores físicos não faz parte do escopo implementado. Ver [Estado atual](#estado-atual).

## Perfis de usuário

O sistema atende três perfis, com acessos distintos:

| Funcionalidade | Cidadão | Funcionário | Administrador |
|----------------|---------|-------------|---------------|
| Aplicativo móvel | sim | sim | sim |
| Painel administrativo web | não | não | sim |
| Mapa e detalhes dos dispositivos | sim | sim | sim |
| Leitura de QR Code | sim | sim | sim |
| Relatar problema | sim | sim | sim |
| Ordens de serviço | não | apenas as designadas | todas |
| Registro de manutenção | não | sim | sim |
| Cadastro de dispositivos e zonas | não | não | sim |
| Custos operacionais, relatórios, auditoria | não | não | sim |

## Arquitetura

O repositório é um monorepo com dois componentes:

- `backend`: API REST e painel administrativo em Django, com dados espaciais em PostGIS.
- `mobile`: aplicativo em React Native (Expo) usado por cidadãos e por técnicos em campo.

O backend concentra a regra de negócio e expõe duas interfaces:

1. Painel administrativo Django (tema Jazzmin) para os operadores da prefeitura, com mapas
   Leaflet de dispositivos e de ordens de serviço e um módulo de relatórios em Chart.js.
   Autenticação por sessão.
2. API REST (Django REST Framework) consumida pelo aplicativo, com autenticação JWT e
   esquema OpenAPI gerado pelo drf-spectacular.

O aplicativo acessa apenas a API. A leitura de QR Code identifica o dispositivo pelo campo
`code` e abre o fluxo de relato já vinculado a ele.

Alterações em qualquer modelo são gravadas em `audit.AuditLog` por signals, com comparativo
entre o estado anterior e o posterior. Todo e-mail enviado fica registrado em
`audit.MailHistory`, com o HTML renderizado consultável pelo admin.

### Aplicações Django

| Aplicação   | Responsabilidade |
|-------------|------------------|
| `core`      | Modelos de domínio, mailers, signals de auditoria, comandos de gestão |
| `accounts`  | Usuário customizado (login por e-mail) e os três perfis de acesso |
| `api`       | Serializers, views e rotas da API REST |
| `maps`      | Views de mapa embutidas no admin |
| `analytics` | Relatórios e gráficos do admin |
| `audit`     | Log de alterações e histórico de e-mails |
| `bootstrap` | Configuração do projeto (settings, urls, wsgi, asgi) |

### Modelo de domínio

`LightingDevice` é a entidade central. Cada dispositivo tem código único, localização
(`PointField`), endereço, zona, características físicas, status operacional e um QR Code
gerado automaticamente no `save()` a partir do código.

- `Zone`: área geográfica (`PolygonField`) que agrupa dispositivos, com cor própria no mapa.
- `Sensor`: vinculado a um dispositivo (1:1), com tipo de conexão (Wi-Fi, LoRaWAN, LoRa Mesh),
  versão de firmware e nível de bateria.
- `ReportedProblem`: relato de falha, com origem (cidadão, sensor, administrador, funcionário).
- `ServiceOrder`: ordem de serviço com prioridade, responsável e problemas relatados
  associados. A localização é sincronizada com a do dispositivo.
- `Maintenance`: execução da manutenção. Ao ser salva, conclui a ordem de serviço vinculada.
- `OperationalCost`: custo de instalação, manutenção ou operação de um dispositivo.

O fluxo típico vai do relato até o custo: o cidadão registra um `ReportedProblem`, o
administrador abre uma `ServiceOrder` associada e designa um responsável, o técnico executa e
registra a `Maintenance` pelo aplicativo informando o `OperationalCost`, e a ordem é fechada.

### Relatórios

O módulo de análise do admin reúne gráficos agrupados por eixo: dispositivos (distribuição por
zona, status operacional, tipos instalados, idade média), manutenções, problemas (incidência
por tipo de dispositivo, taxa de resolução por zona, origem dos relatos), ordens de serviço
(tempo médio de conclusão por prioridade, carga por técnico), custos (total por zona,
composição por tipo, evolução mensal) e usuários.

## Estado atual

Implementado e em funcionamento: cadastro e mapa de dispositivos e zonas, relato de problemas
pelo aplicativo, ordens de serviço, manutenções, custos operacionais, QR Code, relatórios,
auditoria e histórico de e-mails.

Não implementado: a ingestão de dados de sensores IoT. O modelo `Sensor` e a origem `SENSOR`
em `ReportedProblem` existem no banco, mas não há endpoint de telemetria nem abertura
automática de ordem de serviço a partir de uma falha detectada por sensor. O relato depende
de uma pessoa.

## Stack

Backend: Python 3.10, Django 5.0, Django REST Framework, SimpleJWT, drf-spectacular,
django-leaflet, django-chartjs, Jazzmin, GDAL 3.6.4, PostgreSQL com PostGIS, Gunicorn,
WhiteNoise.

Mobile: Expo SDK 51, React Native 0.74, TypeScript, expo-router, React Hook Form com Yup,
axios, react-native-maps, react-native-paper, styled-components.

## Execução com Docker

Requer Docker e Docker Compose.

```bash
docker compose up --build
```

Serviços disponíveis:

| Serviço | Endereço | Descrição |
|---------|----------|-----------|
| API e admin | http://localhost:8001 | Django em modo desenvolvimento |
| Adminer | http://localhost:8080 | Cliente do banco |
| Mailhog | http://localhost:8025 | Caixa de entrada dos e-mails de teste |
| PostgreSQL | localhost:5432 | Banco com PostGIS |

As migrações e o `collectstatic` rodam automaticamente na subida do contêiner
(`backend/scripts/start-api.sh`).

### Primeiro acesso

O modelo de usuário exige data de nascimento, que o `createsuperuser` não solicita, então o
primeiro administrador deve ser criado pelo shell:

```bash
docker compose exec ipici-api python manage.py shell -c "from accounts.models import CustomUser; CustomUser.objects.create_superuser(email='admin@ipici.local', password='senha', birth_date='1990-01-01')"
```

A criação de qualquer usuário dispara um e-mail de boas-vindas com link para definição de
senha, visível no Mailhog.

O painel fica em http://localhost:8001/admin/ e a documentação da API em
http://localhost:8001/api/schema/swagger-ui/.

## Execução do backend sem Docker

A dependência GDAL precisa estar instalada no sistema antes do `pip install`, e o banco precisa
ter a extensão PostGIS habilitada (ver `backend/init_postgis.sql`).

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Variáveis de ambiente

Lidas em `backend/bootstrap/settings.py`. Os valores usados em desenvolvimento estão no
`docker-compose.yml`.

| Variável | Descrição |
|----------|-----------|
| `SECRET_KEY` | Chave de assinatura do Django e dos tokens JWT |
| `DEBUG` | Modo de depuração |
| `ALLOWED_HOSTS` | Hosts aceitos |
| `CSRF_TRUSTED_ORIGINS` | Origens confiáveis para CSRF |
| `BASE_URL` | URL base usada nos links enviados por e-mail |
| `DATABASE_ENGINE` | `postgresql` ou `sqlite` |
| `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` | Conexão com o banco |
| `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_USE_SSL`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL` | Envio de e-mail |

## Aplicativo móvel

```bash
cd mobile/ipici
npm install
npx expo start
```

O endereço da API é lido de `API_URL` (`mobile/ipici/app.config.ts`), definido em
`mobile/ipici/.env`:

```
API_URL=http://192.168.0.10:8001/api
```

Em dispositivo físico é necessário usar o IP da máquina na rede local, não `localhost`, e
incluir esse IP em `ALLOWED_HOSTS`.

Telas: autenticação, cadastro, recuperação de senha, mapa de dispositivos com filtros por tipo
e status, mapa de ordens de serviço (funcionários), leitura de QR Code, relato de problema,
registro de manutenção e perfil do usuário. O mapa aceita os modos padrão, satélite, híbrido e
terreno, e a busca por endereço usa a API Nominatim do OpenStreetMap.

## API

Base: `/api/`. Autenticação por Bearer token obtido em `/api/auth/`.

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/` | Obtém o par de tokens |
| POST | `/api/auth/verify/` | Valida um token |
| GET, POST | `/api/users/` | Lista e cria usuários |
| GET | `/api/users/me/` | Usuário autenticado |
| GET, PUT, DELETE | `/api/users/{id}/` | Detalhe do usuário |
| POST | `/api/user/password_reset_request/` | Solicita redefinição de senha |
| GET | `/api/user/reset/{uidb64}/{token}/validate/` | Valida o token de redefinição |
| POST | `/api/user/reset/{uidb64}/{token}/` | Confirma a nova senha |
| GET | `/api/devices/` | Lista dispositivos |
| GET | `/api/devices/{id}/` | Detalhe do dispositivo |
| GET | `/api/devices/by-qr/?code=` | Busca dispositivo pelo código do QR Code |
| GET, POST | `/api/problems/` | Lista e cria problemas relatados |
| GET, PUT, DELETE | `/api/problems/{id}/` | Detalhe do problema |
| GET, POST | `/api/service-orders/` | Lista e cria ordens de serviço |
| GET, PUT, DELETE | `/api/service-orders/{id}/` | Detalhe da ordem de serviço |
| GET | `/api/service-orders/device/{device_id}/` | Ordens de um dispositivo |
| GET, POST | `/api/maintenances/` | Lista e cria manutenções |
| GET, PUT, DELETE | `/api/maintenances/{id}/` | Detalhe da manutenção |

Esquema OpenAPI em `/api/schema/`, com interfaces em `/api/schema/swagger-ui/` e
`/api/schema/redoc/`.

## Comandos de gestão

Regenera os QR Codes dos dispositivos. Sem `--force`, gera apenas os ausentes:

```bash
python manage.py generate_qrcodes [--force]
```

## Estrutura do repositório

```
backend/
  accounts/      usuário customizado e autenticação
  analytics/     relatórios do admin
  api/           camada REST (serializers, views, urls, middlewares)
  audit/         auditoria e histórico de e-mails
  bootstrap/     settings, urls, wsgi, asgi
  core/          modelos de domínio, mailers, services, signals, templates
  maps/          views de mapa do admin
  scripts/       entrypoints de desenvolvimento e produção
mobile/ipici/
  src/app/       rotas e telas (expo-router)
  src/components/
  src/service/   clientes HTTP da API
docker-compose.yml
```

## Trabalho acadêmico

VEIGA, Carlos Eduardo Nogueira de Freitas. *Iluminação Pública Inteligente para Cidades
Inteligentes: Convergência entre Segurança, Sustentabilidade e Participação com o uso de IoT*.
2025. 103 f. Trabalho de Conclusão de Curso, Bacharelado em Engenharia de Software,
Universidade Tecnológica Federal do Paraná. Cornélio Procópio, 2025.

Orientador: Dr. André Luiz Przybysz. Coorientadora: Dra. Regina Negri Pagani.
Aprovado em 10 de fevereiro de 2025.

A monografia está licenciada sob Creative Commons BY-NC-ND 4.0 Internacional.

## Licença

O código deste repositório está sob licença MIT. Ver `LICENSE`.
