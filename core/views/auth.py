import logging
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from ..models import User
from ..serializers import UserRegistrationSerializer

from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from django.contrib.auth import authenticate
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.forms import PasswordChangeForm, PasswordResetForm
from django.core.exceptions import ValidationError
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

class LoginView(APIView):
    """
    API view for user login.
    """
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class SignupView(APIView):
    """
    API view for user registration.

    Uses UserSerializer for validation (e.g. email) and saving user data.
    """
    def post(self, request):
        logger.info("Received signup request")
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                logger.info(f"User created successfully: {user.email}")
                return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.exception(f"Unexpected error in signup request: {str(e)}")
                return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        logger.error(f"Validation error in signup request: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    """
    API view for changing user password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        form = PasswordChangeForm(user=request.user, data=request.data)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            logger.info(f"Password changed successfully for user: {user.email}")
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        logger.warning(f"Invalid password change attempt for user: {request.user.email}")
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetView(APIView):
    """
    API view for initiating password reset process.
    """
    def post(self, request):
        form = PasswordResetForm(request.data)
        if form.is_valid():
            email = form.cleaned_data['email']
            users = User.objects.filter(email=email)
            if users.exists():
                user = users.first()
                subject = 'Password Reset Requested'
                email_template_name = 'password_reset_email.txt'
                c = {
                    "email": user.email,
                    'domain': 'localhost:8000',  # Change this to your domain
                    'site_name': 'Your Site',
                    "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                    "user": user,
                    'token': default_token_generator.make_token(user),
                    'protocol': 'http',  # Use 'https' for production
                }
                email = render_to_string(email_template_name, c)
                send_mail(subject, email, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
                logger.info(f"Password reset email sent to: {user.email}")
                return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
        logger.warning(f"Invalid password reset attempt for email: {request.data.get('email')}")
        return Response({'error': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)