from django import forms
from .models import CustomUser


class CustomUserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput, required=False)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput, required=False)
    birth_date = forms.DateField(label='Data de Nascimento', required=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'birth_date', 'first_name', 'last_name', 'is_staff', 'is_active')

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        password1 = self.cleaned_data.get("password1")

        birth_date = self.cleaned_data.get("birth_date")
        user.birth_date = birth_date

        if password1:
            user.set_password(password1)
        else:
            user.set_unusable_password()

        if commit:
            user.save()
        return user
