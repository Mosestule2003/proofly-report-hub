
import React from 'react';
import AdminSidebarWithProps from '@/components/admin/AdminSidebarWithProps';
import AdminTopBarWithTrigger from '@/components/admin/AdminTopBarWithTrigger';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { Order } from '@/components/admin/types';
import EnhancedDashboardStats from '@/components/admin/EnhancedDashboardStats';
import LastTransactions from '@/components/admin/LastTransactions';
import AIOutreachStats from '@/components/admin/AIOutreachStats';
import KeyMetricsCards from '@/components/admin/KeyMetricsCards';
import SalesChart from '@/components/admin/SalesChart';
import ActivityCards from '@/components/admin/ActivityCards';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import PropertyHeatmap from '@/components/admin/PropertyHeatmap';
import PendingOrders from '@/components/admin/PendingOrders';
import PendingInquiries from '@/components/admin/PendingInquiries';

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
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                <h1 className="text-2xl font-semibold">Hello, Admin!</h1>
                <p className="text-muted-foreground">Explore information and activity about properties</p>
              </div>
              
              <div className="relative w-full md:w-auto">
                <input 
                  placeholder="Search anything..." 
                  className="pl-10 w-full md:w-[300px] border rounded-md py-2 px-4"
                />
              </div>
            </div>

            {/* Main dashboard grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* First column: 1/3 width on large screens */}
              <div className="lg:col-span-1 space-y-6">
                {/* Admin metrics */}
                {metrics && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Registered Tenants</p>
                        <p className="font-medium">{metrics.tenantCount}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="font-medium">{metrics.orderCount}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Pending Evaluations</p>
                        <p className="font-medium">{metrics.pendingOrderCount}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Completed Evaluations</p>
                        <p className="font-medium">{metrics.completedOrderCount}</p>
                      </div>
                    </div>
                  </div>
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
                <KeyMetricsCards orders={pendingOrders as unknown as any[]} />
                
                {/* Charts */}
                <SalesChart />
                
                {/* Activity cards */}
                <ActivityCards completedOrders={completedOrders as unknown as any[]} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent activity feed */}
                  <RecentActivityFeed activities={activityItems} className="h-full" />
                  
                  {/* Property heatmap */}
                  <PropertyHeatmap className="h-full" />
                </div>
                
                {/* Pending orders with evaluator assignment */}
                <PendingOrders 
                  pendingOrders={pendingOrders as unknown as any[]}
                  evaluators={evaluators}
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

export default Admin;
