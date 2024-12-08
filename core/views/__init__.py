from .user import UserProfileView, UserPasswordChangeView, UserPasswordResetView
from .auth import CustomConfirmEmailView

__all__ = [
    'UserProfileView',
    'UserPasswordChangeView',
    'UserPasswordResetView',
    'CustomConfirmEmailView',
]