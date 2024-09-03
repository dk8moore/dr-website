from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.conf import settings
from django.core.mail import send_mail
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.forms import PasswordResetForm
from django.template.loader import render_to_string

from ..models import User
from ..serializers import UserFullSerializer, UserInfoUpdateSerializer, UserCredentialsUpdateSerializer, UserPasswordChangeSerializer

import os
import uuid
from PIL import Image
from io import BytesIO
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
        if 'email' in self.request.data:
            return UserCredentialsUpdateSerializer
        return UserInfoUpdateSerializer

    def get_object(self):
        return self.request.user
    
    @staticmethod
    def process_image(file):
        img = Image.open(file)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        max_size = (300, 300)
        img.thumbnail(max_size)
        buffer = BytesIO()                              # Create a buffer to store the image
        img.save(buffer, format='JPEG', quality=85)     # Save the image to the buffer with a JPEG format and 85% quality
        buffer.seek(0)                                  # Seek to the beginning of the buffer       
        return InMemoryUploadedFile(
            buffer,
            'ImageField',
            f"{uuid.uuid4()}.jpg",
            'image/jpeg',
            buffer.getbuffer().nbytes,
            None
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        if 'profile_picture' in request.FILES:
            file = request.FILES['profile_picture']
            logger.info(f"Received file: {file.name}, size: {file.size}, content type: {file.content_type}")
            processed_image = self.process_image(file)
            serializer.validated_data['profile_picture'] = processed_image

        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
    
    def perform_update(self, serializer):
        # Custom logic to save the processed image
        instance = serializer.save()
        if 'profile_picture' in serializer.validated_data:
            file = serializer.validated_data['profile_picture']
            if file is None or file == '':
                # Remove the existing profile picture
                if instance.profile_picture:
                    # Delete the file from storage
                    if os.path.isfile(instance.profile_picture.path):
                        os.remove(instance.profile_picture.path)
                    # Clear the field
                    instance.profile_picture = None
                    instance.save()
                    logger.info(f"Removed profile picture for user: {instance.username}")
            elif isinstance(file, InMemoryUploadedFile):
                # Process and save the new profile picture
                # Ensure the upload directory exists
                upload_dir = os.path.join(settings.MEDIA_ROOT, 'profile_pics')
                os.makedirs(upload_dir, exist_ok=True)

                # Save the processed image
                filename = file.name
                full_path = os.path.join(upload_dir, filename)

                with open(full_path, 'wb') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)

                # Update the profile_picture field with the new path
                relative_path = os.path.join('profile_pics', filename)
                instance.profile_picture = relative_path
                instance.save()

                logger.info(f"Saved processed profile picture to: {relative_path}")
    
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
                    'protocol': 'https',
                }
                email = render_to_string(email_template_name, c)
                send_mail(subject, email, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
                logger.info(f"Password reset email sent to: {user.email}")
                return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
        logger.warning(f"Invalid password reset attempt for email: {request.data.get('email')}")
        return Response({'error': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)