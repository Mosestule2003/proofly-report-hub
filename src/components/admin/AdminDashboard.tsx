
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMetrics from '@/components/AdminMetrics';
import EnhancedDashboardStats from '@/components/admin/EnhancedDashboardStats';
import SalesChart from '@/components/admin/SalesChart';
import PendingInquiries from '@/components/admin/PendingInquiries';
import PendingOrders from '@/components/admin/PendingOrders';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import ActivityCards from '@/components/admin/ActivityCards';
import KeyMetricsCards from '@/components/admin/KeyMetricsCards';
import AIOutreachStats from '@/components/admin/AIOutreachStats';
import PropertyHeatmap from '@/components/admin/PropertyHeatmap';
import LastTransactions from '@/components/admin/LastTransactions';
import { Evaluator as EvaluatorProfile } from '@/components/EvaluatorProfile';
import { 
  AdminMetricsType,
  Order,
  Transaction, 
  ActivityItem 
} from '@/components/admin/types';
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
            <AdminHeader 
              userName="Admin" 
              searchTerm=""
              setSearchTerm={() => {}}
            />

            {/* Main dashboard grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* First column: 1/3 width on large screens */}
              <div className="lg:col-span-1 space-y-6">
                {/* Admin metrics */}
                {metrics && (
                  <AdminMetrics 
                    tenantCount={metrics.tenantCount} 
                    orderCount={metrics.orderCount}
                    pendingOrderCount={metrics.pendingOrderCount}
                    completedOrderCount={metrics.completedOrderCount}
                  />
                )}
                
                {/* Condensed stats */}
                <EnhancedDashboardStats 
                  totalOrders={metrics?.orderCount || 0}
                  evaluationsInProgress={metrics?.pendingOrderCount || 0}
                  totalRevenue={75000}
                  evaluationCompletionRate={65}
                />
                
                {/* Transactions */}
                <LastTransactions transactions={transactions} />
                
                {/* AI Outreach Stats */}
                <AIOutreachStats />
              </div>
              
              {/* Second column: 2/3 width on large screens */}
              <div className="lg:col-span-2 space-y-6">
                {/* Key metrics cards */}
                <KeyMetricsCards orders={pendingOrders} />
                
                {/* Charts */}
                <SalesChart />
                
                {/* Activity cards */}
                <ActivityCards completedOrders={completedOrders} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent activity feed */}
                  <RecentActivityFeed activities={activityItems} className="h-full" />
                  
                  {/* Property heatmap */}
                  <PropertyHeatmap className="h-full" />
                </div>
                
                {/* Pending orders with evaluator assignment */}
                <PendingOrders 
                  pendingOrders={pendingOrders} 
                  evaluators={evaluators as unknown as EvaluatorProfile[]}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
                
                {/* Pending inquiries */}
                <PendingInquiries />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
