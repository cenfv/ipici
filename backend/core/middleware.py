class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, 'user'):
            self._set_current_user(request.user)
        response = self.get_response(request)
        self._clear_current_user()
        return response

    def _set_current_user(self, user):
        from django.db.models import Model
        Model._current_user = user if user.is_authenticated else None

    def _clear_current_user(self):
        from django.db.models import Model
        if hasattr(Model, '_current_user'):
            del Model._current_user