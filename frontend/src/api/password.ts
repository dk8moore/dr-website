import { AxiosInstance } from 'axios';
import { logger } from '@lib/logger';

interface PasswordChangeData {
  old_password: string;
  new_password: string;
}

/**
 * PasswordAPI class handles all password-related API calls.
 */
export class PasswordAPI {
  /**
   * Creates an instance of PasswordAPI.
   * @param api - The axios instance for making API calls
   */
  constructor(private api: AxiosInstance) {}

  /**
   * Changes the current user's password.
   * @param passwordData - The old and new password data
   * @returns A promise that resolves to the API response
   */
  async changePassword(passwordData: PasswordChangeData) {
    try {
      const response = await this.api.post('/user/change-password/', passwordData);
      logger.log('Change password response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Requests a password reset for the given email.
   * @param email - The email of the user requesting the password reset
   * @returns A promise that resolves to the API response
   */
  async requestPasswordReset(email: string) {
    try {
      const response = await this.api.post('/user/reset-password/', { email });
      logger.log('Password reset request response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }
  }
}