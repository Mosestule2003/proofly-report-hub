import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'admin';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isImpersonating: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  returnToAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize mock users
export const mockUsers: User[] = [
  { 
    id: '1', 
    email: 'tenant@example.com', 
    name: 'Demo Tenant', 
    role: 'tenant',
    createdAt: new Date().toISOString()
  },
  { 
    id: '2', 
    email: 'admin@example.com', 
    name: 'Admin User', 
    role: 'admin',
    createdAt: new Date().toISOString()
  },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  
  // Sync mockUsers with API on mount
  useEffect(() => {
    // Sync our mockUsers with the API service
    api.syncUsers(mockUsers);
  }, []);
  
  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('proofly_user');
    const adminReturnId = localStorage.getItem('admin_return_user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsImpersonating(!!adminReturnId);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('proofly_user');
        localStorage.removeItem('admin_return_user');
      }
    }
    
    setIsLoading(false);
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 800));
    
    // Find user with matching email (tenant only)
    const foundUser = mockUsers.find(u => u.email === email && u.role === 'tenant');
    
    if (foundUser) {
      // In a real app, we would verify the password
      setUser(foundUser);
      localStorage.setItem('proofly_user', JSON.stringify(foundUser));
      toast.success(`Welcome back, ${foundUser.name}!`);
      return true;
    }
    
    toast.error("Invalid email or password");
    return false;
  };
  
  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 800));
    
    // Find admin user with matching email
    const foundUser = mockUsers.find(u => u.email === email && u.role === 'admin');
    
    if (foundUser) {
      // In a real app, we would verify the password
      setUser(foundUser);
      localStorage.setItem('proofly_user', JSON.stringify(foundUser));
      toast.success(`Welcome back, ${foundUser.name}!`);
      return true;
    }
    
    toast.error("Invalid admin credentials");
    return false;
  };
  
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if email already exists
    if (mockUsers.some(u => u.email === email)) {
      toast.error("Email already in use");
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role: 'tenant',
      createdAt: new Date().toISOString()
    };
    
    // Add to mock users (in a real app, this would be stored in a database)
    mockUsers.push(newUser);
    
    // Sync users with API
    api.syncUsers(mockUsers);
    
    // Log in the user
    setUser(newUser);
    localStorage.setItem('proofly_user', JSON.stringify(newUser));
    toast.success("Account created successfully!");
    
    return true;
  };
  
  const logout = () => {
    // If impersonating, clear that state too
    if (isImpersonating) {
      localStorage.removeItem('admin_return_user');
      setIsImpersonating(false);
    }
    
    setUser(null);
    localStorage.removeItem('proofly_user');
    toast.info("Logged out successfully");
  };
  
  // Method to return to admin after impersonating
  const returnToAdmin = async () => {
    if (!isImpersonating) {
      toast.error("Not currently impersonating a user");
      return;
    }
    
    try {
      await api.returnToAdmin();
      
      // Update local state based on the new user from localStorage
      const storedUser = localStorage.getItem('proofly_user');
      if (storedUser) {
        const adminUser = JSON.parse(storedUser);
        setUser(adminUser);
        setIsImpersonating(false);
        toast.success(`Returned to admin account: ${adminUser.name}`);
      }
    } catch (error) {
      console.error('Error returning to admin:', error);
      toast.error("Failed to return to admin account");
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isImpersonating,
    login,
    loginAdmin,
    signup,
    logout,
    returnToAdmin
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
