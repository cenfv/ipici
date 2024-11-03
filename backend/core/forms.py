from django import forms
from core.models import Zone

class ZoneAdminForm(forms.ModelForm):
    boundary_color = forms.CharField(
        max_length=7,
        widget=forms.TextInput(attrs={'type': 'color'}),
        label="Cor da Zona"
    )

    class Meta:
        model = Zone
        fields = '__all__'