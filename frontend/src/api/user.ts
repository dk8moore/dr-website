import { AxiosInstance } from 'axios';
import { logger } from '@lib/logger';

interface UserProfile {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  birth_date?: string;
  phone_number?: string;
  urls?: string[];
  address?: string;
}

/**
 * UserAPI class handles all user-related API calls.
 */
export class UserAPI {
  /**
   * Creates an instance of UserAPI.
   * @param api - The axios instance for making API calls
   */
  constructor(private api: AxiosInstance) {}

  /**
   * Retrieves the current user's profile.
   * @returns A promise that resolves to the user's profile data
   */
  async getUserProfile() {
    try {
      const response = await this.api.get('/profile/');
      logger.log('Get user profile response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Updates the current user's profile.
   * @param profileData - The updated profile data
   * @returns A promise that resolves to the updated profile data
   */
  async updateUserProfile(profileData: UserProfile) {
    try {
      const response = await this.api.put('/profile/', profileData);
      logger.log('Update user profile response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }
}