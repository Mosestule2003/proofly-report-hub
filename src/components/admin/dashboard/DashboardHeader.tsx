
import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';

interface DashboardHeaderProps {
  userName: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="w-full mb-6">
      <AdminHeader
        userName={userName}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
};

export default DashboardHeader;
