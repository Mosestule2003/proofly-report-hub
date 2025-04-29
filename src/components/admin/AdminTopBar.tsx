
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/NotificationBell';

interface AdminTopBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ searchTerm, setSearchTerm }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search..." 
            className="pl-10 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <NotificationBell />
        
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatar.png" />
          <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default AdminTopBar;
