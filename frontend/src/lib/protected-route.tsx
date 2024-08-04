import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/use-auth';

interface ProtectedRouteProps {
  authenticationPath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ authenticationPath }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You can show a loading spinner here
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Outlet />;
  } else {
    return <Navigate to={{ pathname: authenticationPath }} />;
  }
};
