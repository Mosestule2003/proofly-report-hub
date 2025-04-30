
import React from 'react';
import { AdminMetricsType, Transaction } from '@/components/admin/types';
import AdminMetrics from '@/components/AdminMetrics';
import EnhancedDashboardStats from '@/components/admin/EnhancedDashboardStats';
import LastTransactions from '@/components/admin/LastTransactions';
import AIOutreachStats from '@/components/admin/AIOutreachStats';

interface StatsColumnProps {
  metrics: AdminMetricsType | null;
  transactions: Transaction[];
}

const StatsColumn: React.FC<StatsColumnProps> = ({ metrics, transactions }) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Admin metrics */}
      {metrics && (
        <AdminMetrics 
          tenantCount={metrics.tenantCount} 
          orderCount={metrics.orderCount}
          pendingOrderCount={metrics.pendingOrderCount}
          completedOrderCount={metrics.completedOrderCount}
          className="shadow-sm hover:shadow transition-shadow"
        />
      )}
      
      {/* Condensed stats */}
      <EnhancedDashboardStats 
        totalOrders={metrics?.orderCount || 0}
        evaluationsInProgress={metrics?.pendingOrderCount || 0}
        totalRevenue={75000}
        evaluationCompletionRate={65}
        className="shadow-sm hover:shadow transition-shadow"
      />
      
      {/* Transactions */}
      <LastTransactions 
        transactions={transactions} 
        className="shadow-sm hover:shadow transition-shadow"
      />
      
      {/* AI Outreach Stats */}
      <AIOutreachStats 
        className="shadow-sm hover:shadow transition-shadow"
      />
    </div>
  );
};

export default StatsColumn;
