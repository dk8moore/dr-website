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
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const authStatus = api.auth.isAuthenticated();
    setIsAuthenticated(authStatus);
    if (authStatus) {
      try {
        await api.auth.refreshToken();
      } catch (error) {
        setIsAuthenticated(false);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [checkAuthStatus]);

  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const signout = useCallback(async () => {
    await api.auth.logout();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, login, signout, checkAuthStatus };
};
