from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import User
from .serializers import UserSerializer
import json

import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from django.shortcuts import render, redirect
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.forms import PasswordChangeForm, PasswordResetForm
from django.contrib.auth import authenticate  
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import UserPasswordResetView
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.template.loader import render_to_string
from django.db.models import F
from django.contrib.auth import get_user_model

# Stripe configuration
# stripe.api_key = settings.STRIPE_SECRET_KEY

# @method_decorator(csrf_exempt, name='dispatch')
# class CreateCheckoutSessionView(generics.GenericAPIView):
#     def post(self, request, *args, **kwargs):
#         domain_url = 'https://localhost:3000/'
#         try:
#             checkout_session = stripe.checkout.Session.create(
#                 payment_method_types=['card'],
#                 line_items=[{
#                     'price_data': {
#                         'currency': 'usd',
#                         'product_data': {
#                             'name': 'Your Product Name',
#                         },
#                         'unit_amount': 2000,
#                     },
#                     'quantity': 1,
#                 }],
#                 mode='payment',
#                 success_url=domain_url + 'success?session_id={CHECKOUT_SESSION_ID}',
#                 cancel_url=domain_url + 'cancel',
#             )
#             return JsonResponse({
#                 'id': checkout_session.id
#             })
#         except Exception as e:
#             return JsonResponse({
#                 'error': str(e)
#             })
        
