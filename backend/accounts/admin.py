from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm
from .models import CustomUser
from django.utils.html import format_html

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    model = CustomUser
    list_display = ['email', 'full_name', 'status_badge', 'created_at']
    list_filter = ['is_active', 'is_staff', ]
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = (
        ('Informações de Acesso', {'fields': ('email',)}),
        ('Informações Pessoais', {
            'fields': ('first_name', 'last_name', 'address', 'birth_date', 'phone',)
        }),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ( 'first_name', 'last_name', 'email', 'birth_date', 'phone', 'is_staff', 'is_active'),
        }),
    )

    def status_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Ativo</span>')
        return format_html('<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Inativo</span>')
    status_badge.short_description = 'Status'

    def full_name(self, obj):
        return obj.get_full_name()
    full_name.short_description = 'Nome Completo'
