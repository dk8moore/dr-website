from .user import UserProfileView, UserPasswordChangeView, UserPasswordResetView
from .auth import CustomConfirmEmailView, ResendEmailVerificationView

__all__ = [
    'UserProfileView',
    'UserPasswordChangeView',
    'UserPasswordResetView',
    'CustomConfirmEmailView',
    'ResendEmailVerificationView',
]