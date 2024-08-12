from allauth.account.views import ConfirmEmailView
from allauth.account.models import EmailAddress
from allauth.account.utils import send_email_confirmation
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

@method_decorator(csrf_exempt, name='dispatch')
class CustomConfirmEmailView(ConfirmEmailView):
    def get(self, *args, **kwargs):
        try:
            self.object = self.get_object()
            self.object.confirm(self.request)
            return JsonResponse({"success": True, "message": "Email successfully confirmed"})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)
        
class ResendEmailVerificationView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            email_address = EmailAddress.objects.get(email=email, verified=False)
            if email_address.send_confirmation(request):
                return Response({"detail": "Verification email resent."}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Failed to resend verification email."}, status=status.HTTP_400_BAD_REQUEST)
        except EmailAddress.DoesNotExist:
            return Response({"detail": "Email not found or already verified."}, status=status.HTTP_400_BAD_REQUEST)