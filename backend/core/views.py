from django.contrib.auth.decorators import user_passes_test
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from django.views import View

from audit.models import MailHistory
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.views import PasswordResetConfirmView
from django.shortcuts import render
from django.urls import reverse_lazy
from .forms import CustomSetPasswordForm

LOGIN_URL = '/admin/logout/'

def index(request):
    return HttpResponse("core")

def staff_required(user):
    return user.is_staff

def unauthorized_response(request):
    return HttpResponse("Unauthorized", status=401)

@user_passes_test(staff_required, login_url=LOGIN_URL)
def view_html_message(request, pk):
    if not request.user.is_staff:
        return unauthorized_response(request)

    mail_history = get_object_or_404(MailHistory, pk=pk)
    return render(request, 'admin/view_html_message.html', {'html_message': mail_history.html_message})

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'registration/password_reset_confirm.html'
    form_class = CustomSetPasswordForm
    success_url = reverse_lazy('core:password_reset_complete')
    token_generator = default_token_generator


class PasswordResetCompleteView(View):
    template_name = "registration/password_reset_complete.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)