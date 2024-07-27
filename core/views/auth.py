from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from ..serializers import UserRegistrationSerializer

from django.contrib.auth import authenticate

import logging
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