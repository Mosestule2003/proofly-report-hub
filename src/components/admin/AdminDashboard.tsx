
import React from 'react';
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
    <div className="w-full flex flex-col space-y-6">
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
  );
};

export default AdminDashboard;
