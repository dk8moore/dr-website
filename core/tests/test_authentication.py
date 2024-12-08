from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
import json

User = get_user_model()

@override_settings(SECURE_SSL_REDIRECT=False)
class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('rest_register')
        self.login_url = reverse('rest_login')
        self.logout_url = reverse('rest_logout')
        self.user_data = {
            'email': 'testuser@example.com',
            'password1': 'testpassword123',
            'password2': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration_and_authentication_flow(self):
        print("\n--- Starting Authentication Flow Test ---")

        # 1. Register a new user
        print("\n1. Registering a new user")
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, 201)
        response_data = json.loads(response.content)
        self.assertTrue('access' in response_data)
        self.assertTrue('refresh' in response_data)
        print(f"   Registration successful. Status code: {response.status_code}")
        print(f"   User created with email: {self.user_data['email']}")
        
        # Verify user in database
        user = User.objects.get(email=self.user_data['email'])
        self.assertIsNotNone(user)
        print(f"   User verified in database. ID: {user.id}")

        # 2. Login
        print("\n2. Logging in with the new user")
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password1']
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        access_token = response_data['access']
        print(f"   Login successful. Status code: {response.status_code}")
        print(f"   Access token received: {access_token[:10]}...")  # Show first 10 chars of token

        # 3. Access protected view (user profile)
        print("\n3. Accessing protected view (user profile)")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        profile_url = reverse('user-profile')
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, 200)
        profile_data = json.loads(response.content)
        print(f"   Profile access successful. Status code: {response.status_code}")
        print(f"   Profile data: {profile_data}")
        
        # 4. Logout
        print("\n4. Logging out")
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, 200)
        print(f"   Logout Response: {response.content}")
        print(f"   Logout successful. Status code: {response.status_code}")

        # 5. Verify that the client no longer sends the token after logout
        print("\n5. Attempting to access profile without token")
        self.client.credentials()  # Clear the authorization header
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, 401)
        print(f"   Access denied as expected. Status code: {response.status_code}")

        # 6. Verify that the original token still works
        print("\n6. Attempting to access profile with original token")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, 200)
        print(f"   Access successful with original token. Status code: {response.status_code}")
        profile_data = json.loads(response.content)
        print(f"   Profile data: {profile_data}")

        print("\n--- Authentication Flow Test Completed Successfully ---")