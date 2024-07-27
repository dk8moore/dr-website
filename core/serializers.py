from rest_framework import serializers
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from .models import User

user_credentials_fields = ['email', 'password']
user_ids_fields = ['username', 'email']
user_info_fields = ['first_name', 'last_name', 'bio', 'birth_date', 'profile_picture', 'phone_number', 'address']

class UserFullSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with all fields. Used for retrieving full user information.
    """
    class Meta:
        model = User
        fields = ['id'] + user_ids_fields + user_info_fields
        read_only_fields = ['id']

class UserInfoUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information. Handles updates to non-credentials user information.
    """
    class Meta:
        model = User
        fields = user_info_fields
    # TODO: Add custom validations for fields like phone number, etc.

class UserCredentialsUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user credentials. Specifically handles updates to username and email, with separate validation
    for each field. This allows users to update either username or email independently.
    """
    email = serializers.EmailField(validators=[validate_email])
    class Meta:
        model = User
        fields = user_ids_fields

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
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