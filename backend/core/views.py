from django.contrib.auth.decorators import user_passes_test
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from .models import MailHistory

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
