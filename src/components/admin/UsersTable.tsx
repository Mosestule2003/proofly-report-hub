
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, UserPlus, Mail, Calendar, Shield, Trash2, Eye } from 'lucide-react';

// Define User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface UsersTableProps {
  users: User[];
  onDeleteUser: (user: User) => void;
  onViewUserDetails: (userId: string) => void;
  isLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  onDeleteUser, 
  onViewUserDetails,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        <User className="h-6 w-6 animate-spin mr-2" />
        Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
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
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No users found
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
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
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <span>{user.name}</span>
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {user.email}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'N/A'}
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
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onViewUserDetails(user.id)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onDeleteUser(user)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
