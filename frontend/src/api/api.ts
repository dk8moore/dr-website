import axios from 'axios';

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
export const signup = async (userData: any) => {
    const response = await api.post('/signup/', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response;
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
        
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            return { success: true, data: response.data };
        } else {
            return { success: false, error: 'Invalid response from server' };
        }
    } catch (error) {
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

export default api;