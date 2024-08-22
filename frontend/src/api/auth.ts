import { AxiosInstance } from 'axios';
import { logger } from '@lib/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class AuthAPI {
  constructor(
    private api: AxiosInstance,
    private clearTokens: () => void
  ) {}

  async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: AuthTokens; error?: string; needsVerification?: boolean }> {
    try {
      const response = await this.api.post<AuthTokens>('/auth/login/', credentials);
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error: any) {
      logger.error('Login error:', error);
      if (error.response?.data?.non_field_errors?.includes('E-mail is not verified.')) {
        return { success: false, error: 'Email not verified', needsVerification: true };
      }
      return { success: false, error: error.response?.data?.detail || 'An error occurred during login' };
    }
  }

  async signup(userData: SignupData): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/registration/', userData);
      logger.log('Signup response:', response.data);
      return { success: true, message: 'Please check your email to verify your account.' };
    } catch (error: any) {
      logger.error('Signup error:', error);
      return { success: false, error: error.response?.data?.detail || 'An error occurred during signup' };
    }
  }

  logout() {
    this.clearTokens();
    this.api.post('/auth/logout/');
    logger.log('User logged out successfully');
  }

  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // convert to milliseconds
      return Date.now() < expiry;
    } catch (e) {
      return false;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return token ? this.isTokenValid(token) : false;
  }

  async refreshToken(): Promise<string | null> {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        const response = await this.api.post<{ access: string }>('/auth/token/refresh/', {
          refresh,
        });
        const newToken = response.data.access;
        localStorage.setItem('access_token', newToken);
        return newToken;
      } catch (error) {
        this.logout();
        throw error;
      }
    }
    return null;
  }

  async verifyEmail(key: string): Promise<ApiResponse> {
    try {
      await this.api.post('/auth/registration/verify-email/', { key });
      return { success: true, message: 'Email verified successfully.' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Failed to verify email' };
    }
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    try {
      await this.api.post('/auth/registration/resend-email/', { email });
      return { success: true, message: 'Verification email resent. Please check your inbox.' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Failed to resend verification email' };
    }
  }
}
