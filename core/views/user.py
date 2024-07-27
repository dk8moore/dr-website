from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.forms import PasswordResetForm
from django.template.loader import render_to_string

from ..models import User
from ..serializers import UserFullSerializer, UserInfoUpdateSerializer, UserCredentialsUpdateSerializer, UserPasswordChangeSerializer

import logging
logger = logging.getLogger(__name__)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating user profiles.
    
    This view allows authenticated users to:
    - GET their own profile information
    - PUT to fully update their profile
    - PATCH to partially update their profile
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserFullSerializer
        if 'username' in self.request.data or 'email' in self.request.data:
            return UserCredentialsUpdateSerializer
        return UserInfoUpdateSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
    
class UserPasswordChangeView(APIView):
    """
    API view for changing user password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UserPasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            update_session_auth_hash(request, user)
            logger.info(f"Password changed successfully for user: {user.email}")
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        logger.warning(f"Invalid password change attempt for user: {request.user.email}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPasswordResetView(APIView):
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