FROM python:3.12.3-alpine

# Set the working directory to /app
WORKDIR /app

# Installing dependencies
RUN apk add --no-cache sed

# Creating a non-root group
RUN addgroup --system django_user_group

# Creating a non-root user
RUN adduser --system --ingroup django_user_group django_user

# Adjusting permissions to new user
RUN chown -R django_user:django_user_group /app

# Prevent Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1

# Prevent Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

# Copy necessary files and directories into the container
COPY . .

# install project dependencies
RUN pip install --upgrade pip

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Change the line break for all the scripts, changing from CRLF to LF
RUN find ./scripts -type f -name "*.sh" -exec sed -i 's/\r$//' {} +

# Make the scripts are executable
RUN chmod +x ./scripts/*.sh

# Expose the default Django port
EXPOSE 8000

CMD ["./scripts/start-production.sh"]
