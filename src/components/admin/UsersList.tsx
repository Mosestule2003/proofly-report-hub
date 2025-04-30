
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { toast } from 'sonner';
import AddUserDialog from './AddUserDialog';
import UsersTable, { User } from './UsersTable';
import DeleteUserDialog from './DeleteUserDialog';
import UsersListHeader from './UsersListHeader';

interface UsersListProps {
  className?: string;
}

const UsersList: React.FC<UsersListProps> = ({ className }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAuth();
  
  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      
      try {
        if (user?.role === 'admin') {
          // Ensure the mock data is initialized with test accounts
          await api.initMockData(user);
          
          // Get all users from the API
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
        toast.error('Failed to load users');
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
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const viewUserDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <UsersListHeader 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          userCount={users.length}
          onAddUser={() => setShowAddUserDialog(true)}
        />
      </CardHeader>
      <CardContent>
        <UsersTable 
          users={filteredUsers}
          onDeleteUser={confirmDeleteUser}
          onViewUserDetails={viewUserDetails}
          isLoading={isLoading}
        />

        {/* Delete User Dialog */}
        <DeleteUserDialog 
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          userToDelete={userToDelete}
          onDelete={handleDeleteUser}
        />

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
