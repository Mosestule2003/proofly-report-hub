
import React from 'react';
import { Order, ActivityItem } from '@/components/admin/types';
import { AdminEvaluator } from '@/hooks/useAdminDashboard';
import { Evaluator } from '@/components/EvaluatorProfile';
import KeyMetricsCards from '@/components/admin/KeyMetricsCards';
import SalesChart from '@/components/admin/SalesChart';
import ActivityCards from '@/components/admin/ActivityCards';
import PendingOrders from '@/components/admin/PendingOrders';
import PendingInquiries from '@/components/admin/PendingInquiries';
import ActivitySection from '@/components/admin/dashboard/ActivitySection';

interface ContentColumnProps {
  pendingOrders: Order[];
  completedOrders: Order[];
  evaluators: AdminEvaluator[];
  activityItems: ActivityItem[];
  handleUpdateOrderStatus: (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => Promise<void>;
}

const ContentColumn: React.FC<ContentColumnProps> = ({
  pendingOrders,
  completedOrders,
  evaluators,
  activityItems,
  handleUpdateOrderStatus
}) => {
  return (
    <div className="lg:col-span-2 space-y-6 w-full">
      {/* Key metrics cards */}
      <KeyMetricsCards 
        orders={pendingOrders} 
        className="shadow-sm hover:shadow transition-shadow"
      />
      
      {/* Charts */}
      <SalesChart className="shadow-sm hover:shadow transition-shadow" />
      
      {/* Activity section with feed and heatmap */}
      <ActivitySection 
        activityItems={activityItems} 
      />
      
      {/* Activity cards - completed orders */}
      <ActivityCards 
        completedOrders={completedOrders}
        className="shadow-sm hover:shadow transition-shadow" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending orders with evaluator assignment */}
        <PendingOrders 
          pendingOrders={pendingOrders} 
          evaluators={evaluators as unknown as Evaluator[]}
          onUpdateStatus={handleUpdateOrderStatus}
          className="shadow-sm hover:shadow transition-shadow h-full"
        />
        
        {/* Pending inquiries */}
        <PendingInquiries className="shadow-sm hover:shadow transition-shadow h-full" />
      </div>
    </div>
  );
};

export default ContentColumn;
