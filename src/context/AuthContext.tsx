
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - we export this so the API service can access it
export const mockUsers: User[] = [
  { id: '1', email: 'tenant@example.com', name: 'Demo Tenant', role: 'tenant' },
  { id: '2', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('proofly_user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('proofly_user');
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
      return true;
    }
    
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
      return true;
    }
    
    return false;
  };
  
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if email already exists
    if (mockUsers.some(u => u.email === email)) {
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role: 'tenant'
    };
    
    // Add to mock users (in a real app, this would be stored in a database)
    mockUsers.push(newUser);
    
    // Log in the user
    setUser(newUser);
    localStorage.setItem('proofly_user', JSON.stringify(newUser));
    
    return true;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('proofly_user');
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginAdmin,
    signup,
    logout
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
