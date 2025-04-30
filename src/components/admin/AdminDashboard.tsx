
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import MainDashboardGrid from '@/components/admin/dashboard/MainDashboardGrid';
import { AdminMetricsType, Order, Transaction, ActivityItem } from '@/components/admin/types';
import { AdminEvaluator } from '@/hooks/useAdminDashboard';

interface AdminDashboardProps {
  metrics: AdminMetricsType | null;
  pendingOrders: Order[];
  completedOrders: Order[];
  evaluators: AdminEvaluator[];
  transactions: Transaction[];
  activityItems: ActivityItem[];
  handleUpdateOrderStatus: (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => Promise<void>;
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  pendingOrders,
  completedOrders,
  evaluators,
  transactions,
  activityItems,
  handleUpdateOrderStatus,
  isMobile,
  sidebarOpen,
  setSidebarOpen
}) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop and slide-over for mobile */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar 
          searchTerm="" 
          setSearchTerm={() => {}} 
        />

        {/* Scrollable main content */}
        <div className="flex-1 overflow-auto pb-8">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <DashboardHeader
              userName="Admin"
              searchTerm=""
              setSearchTerm={() => {}}
            />

            {/* Main dashboard grid */}
            <MainDashboardGrid
              metrics={metrics}
              pendingOrders={pendingOrders}
              completedOrders={completedOrders}
              evaluators={evaluators}
              transactions={transactions}
              activityItems={activityItems}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
