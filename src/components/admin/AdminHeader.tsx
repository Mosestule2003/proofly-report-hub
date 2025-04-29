
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminHeaderProps {
  userName: string | undefined;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  userName, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Hello, {userName || "Admin"}!</h1>
        <p className="text-muted-foreground">Explore information and activity about properties</p>
      </div>
      
      <div className="relative w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search anything..." 
          className="pl-10 w-full md:w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AdminHeader;
