import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Home from './Home';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If the user is an admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Otherwise, show the home page
  return <Home />;
};

export default Index;
