from core.models import Zone
from django import forms
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth import get_user_model


User = get_user_model()

class CustomSetPasswordForm(SetPasswordForm):
    class Meta:
        model = User
        fields = ['new_password1', 'new_password2']

class ZoneAdminForm(forms.ModelForm):
    boundary_color = forms.CharField(
        max_length=7,
        widget=forms.TextInput(attrs={'type': 'color'}),
        label="Cor da Zona"
    )

    class Meta:
        model = Zone
        fields = '__all__'

