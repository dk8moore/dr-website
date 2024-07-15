import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/use-auth';

interface AuthRedirectProps {
  children: React.ReactNode;
}

/**
 * Redirect the user to the dashboard if they are authenticated
 * 
 * @param children - The children to render 
 * @returns The children if the user is not authenticated, otherwise a redirect to the dashboard 
 */
export const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};