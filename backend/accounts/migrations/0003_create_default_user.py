from django.db import migrations
from django.contrib.auth.hashers import make_password
from django.utils import timezone

def create_default_admin(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    Country = apps.get_model('core', 'Country')

    country, _ = Country.objects.get_or_create(
        name='Brasil',
        code='BR'
    )

    if not CustomUser.objects.filter(email='admin@digitalsys.com.br').exists():
        admin_user = CustomUser.objects.create(
            email='admin@admin.com.br',
            password=make_password('admin'),
            first_name='Admin',
            last_name='User',
            phone='11911111111',
            birth_date='1990-01-01',
            is_active=True,
            is_staff=True,
            is_superuser=True,
            created_at=timezone.now(),
            updated_at=timezone.now()
        )


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_initial'),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_admin),
    ]
