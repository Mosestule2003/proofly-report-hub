
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReturnToAdminBanner: React.FC = () => {
  const { isImpersonating, user, returnToAdmin } = useAuth();
  const navigate = useNavigate();
  
  if (!isImpersonating) return null;
  
  const handleReturnToAdmin = async () => {
    await returnToAdmin();
    navigate('/admin');
  };
  
  return (
    <div className="bg-yellow-100 border-b border-yellow-200 p-2 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center text-yellow-800 text-sm">
          <Shield className="h-4 w-4 mr-2" />
          <span>You are viewing as <strong>{user?.name}</strong> (Tenant)</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReturnToAdmin}
          className="bg-white text-yellow-800 border-yellow-300 hover:bg-yellow-50"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Return to Admin
        </Button>
      </div>
    </div>
  );
};

export default ReturnToAdminBanner;
