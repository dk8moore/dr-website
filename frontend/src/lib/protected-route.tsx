import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  authenticationPath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  authenticationPath,
}) => {
  if (isAuthenticated) {
    return <Outlet />;
  } else {
    return <Navigate to={{ pathname: authenticationPath }} />;
  }
};