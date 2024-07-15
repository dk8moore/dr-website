import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@ui/tooltip';
import { LoginForm } from '@page/app/login';
import { SignUpForm } from '@page/app/signup';
import { Dashboard } from '@page/app/examples/dashboard-2';
import { ProtectedRoute } from '@lib/protected-route';
import { useAuth } from '@/lib/use-auth';
import { logger } from '@/lib/logger';
import "@style/app.css";

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  logger.log('AppRoutes: isAuthenticated =', isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route element={<ProtectedRoute authenticationPath="/login"/>}>
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