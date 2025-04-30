
import React from 'react';
import { AdminMetricsType, Order, Transaction, ActivityItem } from '@/components/admin/types';
import { AdminEvaluator } from '@/hooks/useAdminDashboard';
import StatsColumn from '@/components/admin/dashboard/StatsColumn';
import ContentColumn from '@/components/admin/dashboard/ContentColumn';

interface MainDashboardGridProps {
  metrics: AdminMetricsType | null;
  pendingOrders: Order[];
  completedOrders: Order[];
  evaluators: AdminEvaluator[];
  transactions: Transaction[];
  activityItems: ActivityItem[];
  handleUpdateOrderStatus: (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => Promise<void>;
}

const MainDashboardGrid: React.FC<MainDashboardGridProps> = ({
  metrics,
  pendingOrders,
  completedOrders,
  evaluators,
  transactions,
  activityItems,
  handleUpdateOrderStatus
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      {/* First column: 1/3 width on large screens */}
      <StatsColumn 
        metrics={metrics} 
        transactions={transactions} 
      />
      
      {/* Second column: 2/3 width on large screens */}
      <ContentColumn 
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
        evaluators={evaluators}
        activityItems={activityItems}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        className="lg:col-span-2"
      />
    </div>
  );
};

export default MainDashboardGrid;
