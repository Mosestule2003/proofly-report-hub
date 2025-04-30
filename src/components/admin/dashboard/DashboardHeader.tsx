
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
    <AdminHeader
      userName={userName}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
};

export default DashboardHeader;
