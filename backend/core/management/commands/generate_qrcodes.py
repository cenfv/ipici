from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from core.models import LightingDevice


class Command(BaseCommand):
    help = 'Force regenerate QR codes for all devices'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force regeneration of all QR codes, even if they already exist',
        )

    def handle(self, *args, **options):
        devices = LightingDevice.objects.all()
        count = 0
        force = options['force']

        for device in devices:
            try:
                if force:
                    if device.qr_code:
                        if default_storage.exists(device.qr_code.name):
                            default_storage.delete(device.qr_code.name)
                        device.qr_code = None

                    device.generate_qr_code()
                    device.save()
                    count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Regenerated QR code for device {device.code}')
                    )
                else:
                    # Comportamento original
                    should_generate = False
                    if not device.qr_code:
                        should_generate = True
                    elif not default_storage.exists(device.qr_code.name):
                        should_generate = True

                    if should_generate:
                        device.generate_qr_code()
                        device.save()
                        count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'Generated QR code for device {device.code}')
                        )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error generating QR code for device {device.code}: {str(e)}')
                )

        total_devices = devices.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No QR codes needed to be generated'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully generated/regenerated {count} QR codes')
            )

        self.stdout.write(
            self.style.SUCCESS(f'Total devices in system: {total_devices}')
        )