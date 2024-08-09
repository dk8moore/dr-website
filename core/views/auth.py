from allauth.account.views import ConfirmEmailView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class CustomConfirmEmailView(ConfirmEmailView):
    def get(self, *args, **kwargs):
        try:
            self.object = self.get_object()
            self.object.confirm(self.request)
            return JsonResponse({"success": True, "message": "Email successfully confirmed"})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)