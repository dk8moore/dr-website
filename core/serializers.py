from rest_framework import serializers
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.files.uploadedfile import InMemoryUploadedFile
from .models import User

user_credentials_fields = ['email', 'password']
user_info_fields = ['username', 'first_name', 'last_name', 'bio', 'birth_date', 'profile_picture', 'phone_number', 'address']

class UserFullSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with all fields. Used for retrieving full user information.
    """
    class Meta:
        model = User
        fields = ['id', 'email'] + user_info_fields
        read_only_fields = ['id', 'email']

class UserInfoUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information. Handles updates to non-credentials user information.
    """
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = User
        fields = user_info_fields

    def validate_username(self, value):
        if User.objects.filter(username=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value
    
    def validate_profile_picture(self, value):
        if value in (None, '', False):
            return None
        if not isinstance(value, InMemoryUploadedFile):
            raise serializers.ValidationError("Invalid file type.")
        if value.size > 0.5 * 1024 * 1024:
            raise serializers.ValidationError("File size too large. Size should not exceed 500KB.")
        return value
    
    # TODO: Add custom validations for fields like phone number, etc.

class UserCredentialsUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user credentials. Specifically handles updates to email.
    """
    email = serializers.EmailField(validators=[validate_email])
    class Meta:
        model = User
        fields = ['email']

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance
   

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration. Handles creating a new user with email, password, first name, and last name.
    """
    email = serializers.EmailField(validators=[validate_email])
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = user_credentials_fields + ['first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    
class UserPasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user password. Handles validating old and new passwords.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value, user=self.context['request'].user)
        return value

    def validate(self, data):
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError("New password must be different from the old password.")
        return data