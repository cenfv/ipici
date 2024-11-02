import logging

from django.test import TestCase
from faker import Faker

from accounts.models import CustomUser

fake = Faker('pt_BR')
logger = logging.getLogger()


class CustomUserViewTest(TestCase):

    def test_create_super_user(self):
        superuser = CustomUser.objects.create_superuser('test@email.com', password='123456')

        get_user = CustomUser.objects.filter(email='test@email.com').first()

        self.assertEqual(superuser.id, get_user.id)
        self.assertEqual(superuser.get_full_name(), 'test@email.com')
        self.assertTrue(superuser.is_active)
        self.assertTrue(superuser.is_staff)

    def test_create_super_user_with_error_not_staff(self):
        with self.assertRaises(Exception) as context:

            CustomUser.objects.create_superuser('test@email.com', password='123456', is_staff=False)

        self.assertEqual("Superuser deve ter is_staff=True.", context.exception.args[0])

    def test_create_super_user_with_error_not_superuser(self):
        with self.assertRaises(Exception) as context:

            CustomUser.objects.create_superuser('test@email.com', password='123456', is_superuser=False)

        self.assertEqual("Superuser deve ter is_superuser=True.", context.exception.args[0])
