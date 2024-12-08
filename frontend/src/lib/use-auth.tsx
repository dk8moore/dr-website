import { useState, useEffect, useCallback } from 'react';
import api from '@api';
import { initializeWebSocket, closeWebSocket } from '@lib/websocket';

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
        // Only try to refresh if the token is close to expiring
        const token = localStorage.getItem('access_token');
        const payload = JSON.parse(atob(token!.split('.')[1]));
        const expiry = payload.exp * 1000;
        // 5 minutes
        if (expiry - Date.now() < 5 * 60 * 1000) {
          await api.auth.refreshToken();
          console.log('Token refreshed');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        setIsAuthenticated(false);
        api.auth.logout(); // Clear tokens on refresh failure
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000); // Check every 5 minutes

    // Set up WebSocket connection
    const socket = initializeWebSocket();

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'email_verified') {
        checkAuthStatus();
      }
    };

    return () => {
      clearInterval(interval);
      closeWebSocket();
    };
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
