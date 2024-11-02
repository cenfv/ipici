class DisableSessionForAPI:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/backoffice/api/'):
            request.session.modified = False
        return self.get_response(request)