import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Users, User as UserIcon, Shield, Mail, Calendar, UserPlus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
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
import AddUserDialog from './AddUserDialog';

interface UsersListProps {
  className?: string;
}

// Define a local User interface that includes the createdAt property
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string; // Make it optional since some users might not have it
}

const UsersList: React.FC<UsersListProps> = ({ className }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState<boolean>(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      
      try {
        if (user?.role === 'admin') {
          const allUsers = await api.getAllUsers();
          
          // Make sure we cast the API response to our local User interface
          const typedUsers = allUsers as User[];
          
          // Sort in LIFO order (newest first)
          const sortedUsers = [...typedUsers].sort((a, b) => {
            // Use optional chaining and nullish coalescing to handle possible undefined createdAt
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          
          setUsers(sortedUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
    
    // Listen for user updates (new registrations, etc.)
    const unsubscribe = api.subscribeToUserUpdates((data) => {
      if (data.type === 'USERS_UPDATED' && data.users) {
        // Make sure we cast the API response to our local User interface
        const typedUsers = data.users as User[];
        
        // Sort in LIFO order (newest first)
        const sortedUsers = [...typedUsers].sort((a, b) => {
          // Use optional chaining and nullish coalescing to handle possible undefined createdAt
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setUsers(sortedUsers);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await api.deleteUser(userToDelete.id);
      toast.success(`User ${userToDelete.name} has been deleted`);
      // User list will be updated via the subscription
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{users.length} users</Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowAddUserDialog(true)}
            >
              <UserPlus className="h-4 w-4" /> Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32 text-muted-foreground">
            Loading users...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span>{user.name}</span>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={user.role === 'admin' ? "default" : "outline"}>
                          {user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => confirmDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the user account for {userToDelete?.name} and remove all associated data.
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

        {/* Add User Dialog */}
        {showAddUserDialog && (
          <AddUserDialog 
            open={showAddUserDialog} 
            onOpenChange={setShowAddUserDialog} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;
