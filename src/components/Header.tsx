
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import ReturnToAdminBanner from './ReturnToAdminBanner';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  // Don't show header on admin pages except for login
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAdminLoginPage = location.pathname === '/admin/login';
  
  // Only hide on admin pages that are not the login page
  if (isAdminPage && !isAdminLoginPage) {
    return <ReturnToAdminBanner />;
  }

  return (
    <>
      <ReturnToAdminBanner />
      <header className="border-b bg-background">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" />
              </svg>
            </div>
            Proofly
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
