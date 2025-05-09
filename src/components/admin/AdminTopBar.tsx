
import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';

interface AdminTopBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onOpenSidebar?: () => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ 
  searchTerm, 
  setSearchTerm,
  onOpenSidebar
}) => {
  const { user } = useAuth();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div className="border-b p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <Button variant="ghost" size="icon" onClick={onOpenSidebar} className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          )}
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-[250px]"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <NotificationBell />
          
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default AdminTopBar;
