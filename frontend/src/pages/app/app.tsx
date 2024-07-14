import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@ui/tooltip';
import { LoginForm } from '@page/app/login';
import { SignUpForm } from '@page/app/signup';
import { Dashboard } from '@page/app/examples/dashboard-2';
import { ProtectedRoute } from '@lib/protected-route';
import "@style/app.css";

const AppRoutes: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);


  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} authenticationPath="/login"/>}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      {/* Redirect any unknown routes to dashboard if authenticated, otherwise to login */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

export default AppRoutes;