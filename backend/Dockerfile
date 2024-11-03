FROM python:3.12.3-alpine

# Defina o diretório de trabalho como /app
WORKDIR /app

# Instala dependências essenciais para o backend PostGIS do Django
RUN apk add --no-cache gdal gdal-dev geos geos-dev proj proj-dev libc6-compat postgresql-dev build-base

# Configurações de ambiente para evitar pyc e buffering
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copia os arquivos do projeto para o container
COPY . .

# Instala as dependências do Python
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Corrige as quebras de linha e torna os scripts executáveis
RUN find ./scripts -type f -name "*.sh" -exec sed -i 's/\r$//' {} + \
    && chmod +x ./scripts/*.sh

# Exponha a porta padrão do Django
EXPOSE 8000

# Comando para iniciar a aplicação em produção
CMD ["./scripts/start-production.sh"]