from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_signup_redirect_url(self, request):
        return settings.ACCOUNT_SIGNUP_REDIRECT_URL
    
    def get_login_redirect_url(self, request):
        return settings.LOGIN_REDIRECT_URL

    def save_user(self, request, user, form, commit=True):
        user = super().save_user(request, user, form, commit=False)
        user.first_name = form.cleaned_data.get('first_name', '')
        user.last_name = form.cleaned_data.get('last_name', '')
        if commit:
            user.save()
        return user