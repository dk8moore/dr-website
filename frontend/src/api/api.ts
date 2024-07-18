import axios from 'axios';
import { logger } from '@lib/logger';

/**
 * Create an axios instance with the base URL set to the
 * API URL from the environment variables
 * 
 * @param void
 * @returns The axios instance
 */
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL as string,
});

/**
 * Add the token to the request headers before sending
 * the request to the API
 * 
 * @param config - The request configuration
 * @returns The request configuration with the token added
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Sign up the user by sending a POST request to the API
 * with the user's data
 * 
 * @param userData 
 * @returns The response from the API
 */
export const signup = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}) => {
    try {
        const response = await api.post('/signup/', userData);
        logger.log('Signup response:', response.data);
        return response;
    } catch (error) {
        logger.error('Signup error:', error);
        throw error;
    }
};

/**
 * Log in the user by sending a POST request to the API
 * with the user's email and password
 * 
 * @param credentials - The email and password of the user
 * @returns The response from the API 
 * */ 
export const login = async (credentials: { email: string; password: string }) => {
    try {
        const response = await api.post('/login/', credentials);
        logger.log('Login response:', response.data);
        
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            return { success: true, data: response.data };
        } else {
            return { success: false, error: 'Invalid response from server' };
        }
    } catch (error) {
        logger.error('Login error:', error);
        return { success: false, error: 'An error occurred during login' };
    }
};

/**
 * Log out the user by removing the token from local storage
 * 
 * @param void
 * @returns void
 */
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

/**
 * Check if the user is authenticated by checking if the token
 * is present in local storage
 * 
 * @param void
 * @returns boolean
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

/**
 * Refresh the access token by sending a POST request to the API
 * with the refresh token
 * 
 * @param void
 * @returns The new access token
 */
export const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
        try {
            const response = await api.post('/api/token/refresh/', { refresh });
            localStorage.setItem('access_token', response.data.access);
            return response.data.access;
        } catch (error) {
            logout();
            throw error;
        }
    }
    return null;
};

/**
 * Get the current user's profile by sending a GET request to the API
 * 
 * @param void
 * @returns The user's profile data
 */
export const getUserProfile = async () => {
    try {
        const response = await api.get('/profile/');
        logger.log('Get user profile response:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Get user profile error:', error);
        throw error;
    }
};

/**
 * Update the current user's profile by sending a PUT request to the API
 * with the updated profile data 
 * 
 * @param profileData - The data to update the profile with
 * @returns The response about the updated profile
 */
export const updateUserProfile = async (profileData: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    birth_date?: string;
    phone_number?: string;
    address?: string;
}) => {
    try {
        const response = await api.put('/profile/', profileData);
        logger.log('Update user profile response:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Update user profile error:', error);
        throw error;
    }
};

/**
 * Change the current user's password by sending a POST request to the API
 * with the old and new password 
 * 
 * @param passwordData - The old and new password
 * @returns The response about the password change
 */
export const changePassword = async (passwordData: {
    old_password: string;
    new_password: string;
}) => {
    try {
        const response = await api.post('/change-password/', passwordData);
        logger.log('Change password response:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Change password error:', error);
        throw error;
    }
};

/**
 * Request a password reset by sending a POST request to the API
 * with the user's email 
 * 
 * @param email - The email of the user requesting the password reset
 * @returns The response about the password reset request
 */
export const requestPasswordReset = async (email: string) => {
    try {
        const response = await api.post('/password-reset/', { email });
        logger.log('Password reset request response:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Password reset request error:', error);
        throw error;
    }
};


export default api;