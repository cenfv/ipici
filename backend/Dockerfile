# Usa Python 3.10 com Alpine 3.18
FROM python:3.10-alpine3.18

# Define o diretório de trabalho como /app
WORKDIR /app

# Instala GDAL 3.9.3 e outras dependências essenciais para Django e PostGIS
RUN apk add --no-cache gdal=3.6.4-r4 gdal-dev=3.6.4-r4 geos geos-dev proj proj-dev libc6-compat postgresql-dev build-base

# Configurações de ambiente para evitar pyc e buffering
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copia os arquivos do projeto para o container
COPY . .

# Instala as dependências do Python
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Corrige quebras de linha e torna scripts executáveis
RUN find ./scripts -type f -name "*.sh" -exec sed -i 's/\r$//' {} + \
    && chmod +x ./scripts/*.sh

# Exponha a porta padrão do Django
EXPOSE 8000

# Comando para iniciar a aplicação em produção
CMD ["./scripts/start-production.sh"]
