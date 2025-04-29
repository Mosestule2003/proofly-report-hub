
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { User } from '@/services/api';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UsersListProps {
  className?: string;
}

const UsersList: React.FC<UsersListProps> = ({ className }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      
      try {
        if (user?.role === 'admin') {
          const allUsers = await api.getAllUsers();
          
          // Sort in LIFO order (newest first)
          const sortedUsers = [...allUsers].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
    const unsubscribe = api.subscribeToUserUpdates((updatedUsers) => {
      // Sort in LIFO order (newest first)
      const sortedUsers = [...updatedUsers].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setUsers(sortedUsers);
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </CardTitle>
          <Badge variant="outline">{users.length} users</Badge>
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? "default" : "outline"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;
