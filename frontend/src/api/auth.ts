import { AxiosInstance } from 'axios';
import { logger } from '@lib/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * AuthAPI class handles all authentication-related API calls.
 */
export class AuthAPI {
  /**
   * Creates an instance of AuthAPI.
   * @param api - The axios instance for making API calls
   * @param clearTokens - Function to clear auth tokens
   */
  constructor(
    private api: AxiosInstance,
    private clearTokens: () => void
  ) {}

  /**
   * Logs in a user with the provided credentials.
   * @param credentials - The user's login credentials
   * @returns A promise that resolves to an object indicating success and containing auth tokens or an error message
   */
  async login(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; data?: AuthTokens; error?: string }> {
    try {
      const response = await this.api.post<AuthTokens>('/user/login/', credentials);
      logger.log('Login response:', response.data);

      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        logger.log('Access token set:', response.data.access);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      logger.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }

  /**
   * Signs up a new user with the provided data.
   * @param userData - The new user's registration data
   * @returns A promise that resolves to the API response
   */
  async signup(userData: SignupData) {
    try {
      const response = await this.api.post('/user/signup/', userData);
      logger.log('Signup response:', response.data);
      return response;
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user by clearing auth tokens.
   */
  logout() {
    this.clearTokens();
    logger.log('User logged out successfully');
  }

  /**
   * Checks if the user is currently authenticated.
   * @returns A boolean indicating whether the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Refreshes the access token using the refresh token.
   * @returns A promise that resolves to the new access token or null
   */
  async refreshToken(): Promise<string | null> {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        const response = await this.api.post<{ access: string }>('/api/token/refresh/', {
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
}
