"""
URL configuration for the project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from dj_rest_auth.views import PasswordResetConfirmView
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('core/', include('core.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='app'),
    # Auth
    path('core/auth/', include('dj_rest_auth.urls')),
    path('core/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('core/auth/password/reset/confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    # Email verification
    path('core/auth/account-confirm-email/', TemplateView.as_view(), name='account_email_verification_sent'),
    path('core/auth/account-confirm-email/<str:key>/', TemplateView.as_view(), name='account_confirm_email'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)