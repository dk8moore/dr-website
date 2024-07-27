from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from core import views

urlpatterns = [
    # Token views
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Authentication views
    path('user/signup/', views.SignupView.as_view(), name='signup'),
    path('user/login/', views.LoginView.as_view(), name='login'),

    # User views
    path('user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('user/change-password/', views.UserPasswordChangeView.as_view(), name='change-password'),
    path('user/reset-password/', views.UserPasswordResetView.as_view(), name='reset-password'),

    # Other views
    # path('create-checkout-session/', views.CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
]
