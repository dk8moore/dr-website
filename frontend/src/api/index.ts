import axios, { AxiosInstance } from 'axios';
import { logger } from '@lib/logger';

import { AuthAPI } from '@/api/auth';
import { UserAPI } from '@/api/user';
import { PasswordAPI } from '@/api/password';

/**
 * Central API class that manages all API interactions.
 * It sets up the axios instance, interceptors, and initializes all API modules.
 */
class API {
  private axiosInstance: AxiosInstance;
  public auth: AuthAPI;
  public user: UserAPI;
  public password: PasswordAPI;

  /**
   * Creates an instance of the API class.
   * @param baseURL - The base URL for all API calls
   */
  constructor(baseURL: string) {
    this.axiosInstance = axios.create({ baseURL });
    this.setupInterceptors();

    this.auth = new AuthAPI(this.axiosInstance, () => this.clearTokens());
    this.user = new UserAPI(this.axiosInstance);
    this.password = new PasswordAPI(this.axiosInstance);
  }

  /**
   * Sets up request and response interceptors for authentication.
   */
  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await this.auth.refreshToken();
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            logger.error('Error refreshing token:', refreshError);
            this.auth.logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Clears authentication tokens from local storage.
   */
  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

const api = new API(process.env.REACT_APP_API_URL as string);
export default api;
