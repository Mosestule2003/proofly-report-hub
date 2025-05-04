
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import ReturnToAdminBanner from './ReturnToAdminBanner';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout,
    isAuthenticated
  } = useAuth();
  const {
    properties
  } = useCart();

  // Don't show header on admin pages or for admin users
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAdminLoginPage = location.pathname === '/admin/login';
  const isAdminUser = isAuthenticated && user?.role === 'admin';

  // Hide header on admin pages (except login) or for admin users on any page
  if (isAdminPage && !isAdminLoginPage || isAdminUser) {
    return <ReturnToAdminBanner />;
  }
  return <>
      <ReturnToAdminBanner />
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <div className="rounded-md bg-[#FF385C] p-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" />
              </svg>
            </div>
            Proofly
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-[#FF385C] transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-sm font-medium hover:text-[#FF385C] transition-colors">
              Services
            </Link>
            <Link to="/pricing" className="text-sm font-medium hover:text-[#FF385C] transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-[#FF385C] transition-colors">
              About
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative" aria-label="Shopping cart">
              <ShoppingCart className="h-5 w-5" />
              {properties.length > 0 && <span className="absolute -top-1 -right-1 bg-[#FF385C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {properties.length}
                </span>}
            </Button>
            
            {isAuthenticated ? <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')} 
                  className="border-gray-300 hover:bg-[#FF385C] hover:border-[#FF385C] hover:text-white transition-colors"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="hover:bg-[#FF385C] hover:text-white transition-colors"
                >
                  Sign out
                </Button>
              </> : <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')} 
                  className="hover:bg-[#FF385C] hover:text-white transition-colors"
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => navigate('/signup')} 
                  className="bg-[#FF385C] hover:bg-[#e0334f] text-white"
                >
                  Sign up
                </Button>
              </>}
          </div>
        </div>
      </header>
    </>;
}
