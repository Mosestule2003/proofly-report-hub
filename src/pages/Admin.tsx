
import React from 'react';
import AdminSidebarWithProps from '@/components/admin/AdminSidebarWithProps';
import AdminTopBarWithTrigger from '@/components/admin/AdminTopBarWithTrigger';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

const Admin: React.FC = () => {
  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    metrics,
    pendingOrders,
    evaluators,
    transactions,
    completedOrders,
    activityItems,
    handleUpdateOrderStatus
  } = useAdminDashboard();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop and slide-over for mobile */}
      <AdminSidebarWithProps
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBarWithTrigger 
          searchTerm="" 
          setSearchTerm={() => {}} 
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Scrollable main content */}
        <div className="flex-1 overflow-auto pb-8">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
            <AdminDashboard 
              metrics={metrics}
              pendingOrders={pendingOrders}
              completedOrders={completedOrders}
              evaluators={evaluators}
              transactions={transactions}
              activityItems={activityItems}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
              isMobile={isMobile}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
