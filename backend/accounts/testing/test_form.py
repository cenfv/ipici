import unittest
from django.test import TestCase

from  accounts.models import CustomUser
from accounts.forms import CustomUserCreationForm


class TestCustomUserCreationForm(TestCase):
    def setUp(self):
        self.data = {
            'email': 'test@example.com',
            'password1': 'password123',
            'password2': 'password123',
            'is_staff': False,
            'is_active': True
        }

    def test_form_is_valid(self):
        form = CustomUserCreationForm(self.data)
        self.assertTrue(form.is_valid())

    def test_form_is_invalid(self):
        self.data['password2'] = 'password456'
        form = CustomUserCreationForm(self.data)
        self.assertFalse(form.is_valid())

    def test_password_dont_match(self):
        self.data['password1'] = 'password456'
        form = CustomUserCreationForm(self.data)
        self.assertEqual(form.errors['password2'], ["Passwords don't match"])

    def test_password_is_empty(self):
        self.data['password1'] = ''
        self.data['password2'] = ''
        form = CustomUserCreationForm(self.data)
        self.assertTrue(form.is_valid())

    def test_save_form(self):
        form = CustomUserCreationForm(self.data)
        user = form.save()
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.is_staff, False)
        self.assertEqual(user.is_active, True)

    def test_unable_to_get_password(self):
        self.data = {'email': 'test@example.com'}
        form = CustomUserCreationForm(self.data)
        user = form.save()
        self.assertEqual(CustomUser.objects.count(), 1)