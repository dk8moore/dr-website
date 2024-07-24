from django.contrib.auth.models import AbstractUser, Group, Permission
from django.contrib.postgres.fields import ArrayField
from django.db import models

class User(AbstractUser):
    # Inherit from AbstractUser to have all the fields and methods of the default User model
    # which are: username, first_name, last_name, email, password, groups, user_permissions, is_staff, is_active, is_superuser, last_login, date_joined

    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(max_length=255, null=True, blank=True)

    USERNAME_FIELD = 'email'        # Field used for authentication (by default: 'username')            
    REQUIRED_FIELDS = ['username']  # Only for createsuperuser command => email and password are required by default

    def __str__(self):
        return self.email

    @property
    def is_anonymous(self):
        """
        Always return False. This is a way of comparing User objects to
        anonymous users.
        It's used to distinguish between authenticated users and anonymous users.
        """
        return False

    @property
    def is_authenticated(self):
        """
        Always return True. This is a way to tell if the user has been
        authenticated in templates.
        It indicates that instances of this model are always considered authenticated.
        """
        return True