from django.urls import path, include
# from dj_rest_auth.views import PasswordResetConfirmView
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

from core import views

urlpatterns = [
    # Note: The following URLs are automatically included by dj-rest-auth and don't need to be explicitly defined:
    # Login:                     /auth/login/ (POST)                        rest_login
    # Logout:                    /auth/logout/ (POST)                       rest_logout
    # Password Change:           /auth/password/change/ (POST)              rest_password_change
    # Password Reset:            /auth/password/reset/ (POST)               rest_password_reset
    # Password Reset Confirm:    /auth/password/reset/confirm/ (POST)       rest_password_reset_confirm
    # User Details:              /auth/user/ (GET, PUT, PATCH)              rest_user_details
    # Registration:              /auth/registration/ (POST)                 rest_register
    # Verify Email:              /auth/registration/verify-email/ (POST)    rest_verify_email
    # Resend Email Verification: /auth/registration/resend-email/ (POST)    rest_resend_email
    # Password Reset Confirm:    /auth/password/reset/confirm/ (POST)       rest_password_reset_confirm
    # Password Reset Complete:   /auth/password/reset/complete/ (POST)      rest_password_reset_complete

    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    # Custom auth-related views
    path('auth/account-confirm-email/<str:key>/', views.CustomConfirmEmailView.as_view(), name='account_confirm_email'),

    # User profile
    path('user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    # Override the default password reset confirm view
    # This is necessary because dj-rest-auth doesn't provide a default URL for this view
    # path('auth/password/reset/confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # Token views
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Other views
    # path('create-checkout-session/', views.CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
]