from rest_framework import serializers
from django.core.validators import validate_email
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    It also enables same validation of data (e.g. email) for signup and update operations.
    """
    email = serializers.EmailField(validators=[validate_email])
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'bio', 'birth_date', 'profile_picture', 'phone_number', 'address']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def create(self, validated_data):
        validated_data['username'] = validated_data.get('username', validated_data['email'])
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance
    
    # TODO: Add other custom validations for fields like password (length, special characters, etc.), phone number, etc.