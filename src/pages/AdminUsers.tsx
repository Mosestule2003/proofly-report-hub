
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input'; 

// Import components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import UsersList from '@/components/admin/UsersList';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Protect route - only admins can access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast.error("Unauthorized access");
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate, isLoading]);
  
  // Load users data
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        // Wait for auth check
        setTimeout(() => {
          if (!isAuthenticated) {
            setIsLoading(false);
          }
        }, 1000);
        return;
      }
      
      if (user.role !== 'admin') {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Initialize mock data
        await api.initMockData(user);
        
        console.log("Admin Users page: Initialized mock data");
        
        // Wait a bit to simulate API call
        await new Promise(r => setTimeout(r, 500));
        
        // Make sure we trigger an update for all users
        const allUsers = await api.getAllUsers();
        console.log("Admin Users page: Retrieved users:", allUsers);
        
        // Ensure users data is visible for our admins
        api.ensureOrdersVisibleToAdmin();
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error("Failed to load admin data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, isAuthenticated]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Loading users data...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen">
      {/* Left sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <div className="pl-64 min-h-screen">
        <div className="container py-6">
          {/* Top bar */}
          <AdminTopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          <h1 className="text-2xl font-bold mb-6">Users Management</h1>
          
          {/* Users section */}
          <div className="mb-6">
            <UsersList className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
