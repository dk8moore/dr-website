import { useState, useEffect, useCallback } from 'react';
import api from '@api';

/**
 * Custom hook to handle authentication state
 * 
 * @param void
 * @returns An object with the authentication state and functions to login and signout
 */
export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(api.auth.isAuthenticated());

    const checkAuthStatus = useCallback(async () => {
        const authStatus = api.auth.isAuthenticated();
        setIsAuthenticated(authStatus);
        if (authStatus) {
            try {
                await api.auth.refreshToken();
            } catch (error) {
                setIsAuthenticated(false);
            }
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
        const interval = setInterval(checkAuthStatus, 5 * 60 * 1000); // Check every 5 minutes
        return () => clearInterval(interval);
    }, [checkAuthStatus]);

    const login = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const signout = useCallback(() => {
        api.auth.logout();
        setIsAuthenticated(false);
    }, []);

    return { isAuthenticated, login, signout, checkAuthStatus };
};

