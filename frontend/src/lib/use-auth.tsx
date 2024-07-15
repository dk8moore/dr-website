import { useState, useEffect, useCallback } from 'react';
import { isAuthenticated as checkAuth, logout as apiLogout, refreshToken } from '@api/api';

/**
 * Custom hook to handle authentication state
 * 
 * @param void
 * @returns An object with the authentication state and functions to login and signout
 */
export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

    const checkAuthStatus = useCallback(async () => {
        const authStatus = checkAuth();
        setIsAuthenticated(authStatus);
        if (authStatus) {
            try {
                await refreshToken();
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
        apiLogout();
        setIsAuthenticated(false);
    }, []);

    return { isAuthenticated, login, signout, checkAuthStatus };
};

