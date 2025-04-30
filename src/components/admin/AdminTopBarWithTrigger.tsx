
import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/NotificationBell';

interface AdminTopBarWithTriggerProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onOpenSidebar: () => void;
}

const AdminTopBarWithTrigger: React.FC<AdminTopBarWithTriggerProps> = ({ 
  searchTerm, 
  setSearchTerm,
  onOpenSidebar
}) => {
  const { user } = useAuth();
  
  return (
    <div className="border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
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

export default AdminTopBarWithTrigger;
