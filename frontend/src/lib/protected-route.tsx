import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/use-auth';

interface ProtectedRouteProps {
  authenticationPath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ authenticationPath }) => {
  const { isAuthenticated, checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (isAuthenticated) {
    return <Outlet />;
  } else {
    return <Navigate to={{ pathname: authenticationPath }} />;
  }
};
