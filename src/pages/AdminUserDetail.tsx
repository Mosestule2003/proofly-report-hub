
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { User, api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  Key, 
  Trash2,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedUser, setEditedUser] = useState<{
    name: string;
    email: string;
    password: string;
  }>({
    name: '',
    email: '',
    password: '' // For password reset
  });
  
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const userData = await api.getUserById(userId);
        if (userData) {
          setUser(userData);
          setEditedUser({
            name: userData.name,
            email: userData.email,
            password: ''
          });
        } else {
          toast.error("User not found");
          navigate('/admin/users');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [userId, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveChanges = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Only update if there are actual changes
      if (editedUser.name !== user.name || editedUser.email !== user.email) {
        await api.updateUser(userId!, {
          ...user,
          name: editedUser.name,
          email: editedUser.email,
        });
        
        toast.success("User information updated successfully");
      }
      
      // Handle password update separately if provided
      if (editedUser.password) {
        await api.updateUserPassword(userId!, editedUser.password);
        setEditedUser(prev => ({ ...prev, password: '' }));
        toast.success("Password reset successfully");
      }
      
      // Reload user data
      const updatedUser = await api.getUserById(userId!);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user information");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      await api.deleteUser(user.id);
      toast.success(`User ${user.name} has been deleted`);
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
    } finally {
      setShowDeleteDialog(false);
    }
  };
  
  const handleLoginAsUser = () => {
    if (!user) return;
    
    // Store the admin user ID for returning
    localStorage.setItem('admin_return_user', currentUser?.id || '');
    
    // Log in as the selected user
    api.impersonateUser(user.id).then(() => {
      toast.success(`You are now logged in as ${user.name}`);
      navigate('/dashboard'); // Navigate to tenant dashboard
    }).catch(error => {
      console.error('Error impersonating user:', error);
      toast.error("Failed to log in as user");
    });
  };
  
  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <AdminSidebar />
        <div className="pl-64 min-h-screen">
          <div className="container py-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading user data...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen">
      <AdminSidebar />
      <div className="pl-64 min-h-screen">
        <div className="container py-6">
          <AdminTopBar searchTerm="" setSearchTerm={() => {}} />
          
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-4"
              onClick={() => navigate('/admin/users')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
            <h1 className="text-2xl font-bold">User Profile</h1>
          </div>
          
          {user && (
            <div className="grid gap-6">
              {/* User Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <UserIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{user.name}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setShowDeleteDialog(true)} 
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">User ID</div>
                      <div className="mt-1 font-mono text-xs break-all">{user.id}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">Role</div>
                      <div className="mt-1 flex items-center">
                        <Shield className="h-4 w-4 mr-1 text-primary" />
                        {user.role}
                      </div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">Created</div>
                      <div className="mt-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">Status</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleLoginAsUser}
                    variant="default"
                    className="w-full mb-4"
                  >
                    Login as This User
                  </Button>
                  
                  <Tabs defaultValue="profile">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile" className="mt-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            name="name"
                            value={editedUser.name} 
                            onChange={handleInputChange}
                            placeholder="Enter full name"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            name="email"
                            type="email" 
                            value={editedUser.email} 
                            onChange={handleInputChange}
                            placeholder="Enter email address"
                          />
                        </div>
                        
                        <Button 
                          onClick={handleSaveChanges} 
                          disabled={isUpdating || (
                            editedUser.name === user.name && 
                            editedUser.email === user.email &&
                            !editedUser.password
                          )}
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : "Save Changes"}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="security" className="mt-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="password">
                            Reset Password
                          </Label>
                          <Input 
                            id="password" 
                            name="password"
                            type="password" 
                            value={editedUser.password} 
                            onChange={handleInputChange}
                            placeholder="Enter new password"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter a new password to reset this user's password.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={handleSaveChanges} 
                          disabled={isUpdating || !editedUser.password}
                          className="flex items-center"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Resetting...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for {user?.name} and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserDetail;
