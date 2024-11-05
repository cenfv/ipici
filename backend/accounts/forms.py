from django import forms
from .models import CustomUser

class CustomUserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput, required=False)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput, required=False)
    birth_date = forms.DateField(label='Data de Nascimento', required=True)

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'birth_date', 'is_staff', 'is_active')

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        email = self.cleaned_data.get("email")
        birth_date = self.cleaned_data.get("birth_date")
        password1 = self.cleaned_data.get("password1")
        first_name = self.cleaned_data.get("first_name")
        last_name = self.cleaned_data.get("last_name")
        is_staff = self.cleaned_data.get("is_staff", False)
        is_active = self.cleaned_data.get("is_active", True)

        user = CustomUser.objects.create_user(
            email=email,
            password=password1,
            birth_date=birth_date,
            first_name=first_name,
            last_name=last_name,
            is_staff=is_staff,
            is_active=is_active
        )

        self._user = user
        return user

    def save_m2m(self):
        pass