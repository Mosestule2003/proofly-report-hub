
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: ('tenant' | 'admin')[];
  redirectPath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectPath,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // If authentication is still loading, show nothing or a loading indicator
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Check if user is authenticated and has allowed role
  const hasAccess = isAuthenticated && user && allowedRoles.includes(user.role);
  
  // Redirect if not authenticated or doesn't have access
  if (!hasAccess) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Render child routes if user has access
  return <Outlet />;
};
