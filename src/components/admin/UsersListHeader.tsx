
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, UserPlus } from 'lucide-react';

interface UsersListHeaderProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userCount: number;
  onAddUser: () => void;
}

const UsersListHeader: React.FC<UsersListHeaderProps> = ({
  searchTerm,
  onSearchChange,
  userCount,
  onAddUser
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <CardTitle className="text-base flex items-center gap-2">
        <Users className="h-4 w-4" /> Users Management
      </CardTitle>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input 
            placeholder="Search users..."
            className="w-[200px]"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <Badge variant="outline">{userCount} users</Badge>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onAddUser}
        >
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>
    </div>
  );
};

export default UsersListHeader;
