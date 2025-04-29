
import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Home, 
  ShoppingCart, 
  LayoutDashboard, 
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { properties } = useCart();
  const location = useLocation();
  
  // Determine if the user is an admin
  const isAdmin = user?.role === 'admin';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center space-x-2">
            <span className="hidden text-2xl font-bold gradient-text sm:inline-block">
              Proofly
            </span>
          </Link>
          
          <nav className="hidden gap-6 md:flex">
            {/* Show Home link only for non-admin users */}
            {(!isAuthenticated || (isAuthenticated && !isAdmin)) && (
              <Link 
                to="/" 
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/' 
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
            )}
            
            {/* Show Dashboard link for tenant users only */}
            {isAuthenticated && user?.role === 'tenant' && (
              <Link 
                to="/dashboard" 
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/dashboard'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <LayoutDashboard className="mr-1 h-4 w-4" />
                Dashboard
              </Link>
            )}
            
            {/* Show Admin link for admins only */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/admin'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <User className="mr-1 h-4 w-4" />
                Admin
              </Link>
            )}
            
            {/* Show Admin Orders link for admins only */}
            {isAdmin && (
              <Link 
                to="/admin/orders" 
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/admin/orders'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <ShoppingCart className="mr-1 h-4 w-4" />
                Orders
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Only show cart for non-admin users */}
          {(!isAuthenticated || (isAuthenticated && !isAdmin)) && (
            <Link 
              to="/cart" 
              className="relative flex items-center"
            >
              <ShoppingCart className={`h-5 w-5 ${location.pathname === '/cart' ? 'text-primary' : 'text-muted-foreground'}`} />
              
              {properties.length > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {properties.length}
                </span>
              )}
            </Link>
          )}
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium hidden md:block">
                {user?.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground" 
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <LogIn className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Log in</span>
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
