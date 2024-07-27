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
  profile_picture?: File;
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
      const response = await this.api.get('/user/profile/');
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
  async updateUserProfile(profileData: UserProfile | FormData) {
    try {
      let formData: FormData;

      if (!(profileData instanceof FormData)) {
        formData = new FormData();
        Object.entries(profileData).forEach(([key, value]) => {
          if (key === 'profile_picture' && value instanceof File) {
            formData.append('profile_picture', value);
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
      } else {
        formData = profileData;
      }

      const response = await this.api.put('/user/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      logger.log('Update user profile response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }
}