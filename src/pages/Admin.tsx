
import React, { useState, useEffect } from 'react';
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
import CostBreakdown from '@/components/admin/CostBreakdown';
import { api } from '@/services/api';
import { Evaluator } from '@/components/EvaluatorProfile';
import { ActivityItem } from '@/components/admin/RecentActivityFeed';
import { generateDemoActivities } from '@/utils/demoActivityData';
import { Order, OrderStatus } from '@/services/api';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { toast } from 'sonner';

// Adjusted interface to be compatible with Evaluator
interface AdminMetricsType {
  tenantCount: number;
  orderCount: number;
  pendingOrderCount: number;
  completedOrderCount: number;
}

interface Transaction {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetricsType | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { notifications } = useNotificationsContext();

  useEffect(() => {
    // Check if mobile on mount and whenever window resizes
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Function to update metrics data
  const updateMetricsData = async () => {
    try {
      const metricsData = await api.getAdminMetrics();
      setMetrics(metricsData);
      
      // If we got new metrics data, create notification for significant changes
      if (metrics && metricsData) {
        if (metricsData.tenantCount > metrics.tenantCount) {
          const newUsers = metricsData.tenantCount - metrics.tenantCount;
          notifications.addNotification(
            'New Users Registered',
            `${newUsers} new user${newUsers > 1 ? 's' : ''} joined the platform`,
            { type: 'info', showToast: true }
          );
        }
        
        if (metricsData.completedOrderCount > metrics.completedOrderCount) {
          const newCompleted = metricsData.completedOrderCount - metrics.completedOrderCount;
          notifications.addNotification(
            'Evaluations Completed',
            `${newCompleted} new evaluation${newCompleted > 1 ? 's have' : ' has'} been completed`,
            { type: 'success', showToast: true }
          );
        }
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
      toast.error("Failed to load admin metrics");
    }
  };

  // Function to update orders data
  const updateOrdersData = async () => {
    try {
      const orders = await api.getOrders();
      
      // Process orders for different displays
      const pending = orders.filter(order => 
        order.status === 'Pending' || 
        order.status === 'Evaluator Assigned' || 
        order.status === 'In Progress'
      );
      setPendingOrders(pending);
      
      // Set completed orders for ActivityCards
      const completed = orders.filter(order => order.status === 'Report Ready');
      setCompletedOrders(completed);
      
      // Generate activity items based on orders
      const orderActivities: ActivityItem[] = orders.map(order => ({
        id: `order-${order.id}`,
        type: order.status === 'Report Ready' ? 'evaluation_complete' : 
              'booking_confirmed',
        message: `Order placed for ${order.properties && order.properties[0]?.address?.split(',')[0] || 'Unknown location'}`,
        timestamp: order.createdAt,
        read: false,
        userId: order.userId,
        userName: order.userId // Using userId instead of tenantName
      }));
      
      // Combine with other activities
      const combinedActivities = [...orderActivities, ...generateDemoActivities()];
      
      // Sort by timestamp, most recent first
      combinedActivities.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });
      
      setActivities(combinedActivities);
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
      // Fallback to demo activities if real data fails to load
      setActivities(generateDemoActivities());
    }
  };

  useEffect(() => {
    // Initial data loading
    const loadAdminData = async () => {
      // Load admin metrics
      await updateMetricsData();
      
      // Load orders data
      await updateOrdersData();
      
      // Load evaluators for the assignment widget
      try {
        const data = await api.getAllEvaluators();
        setEvaluators(data);
      } catch (err) {
        console.error("Failed to load evaluators:", err);
        toast.error("Failed to load evaluators data");
      }
      
      // Load sales data for charts
      try {
        const data = await api.getSalesData();
        setSalesData(data);
      } catch (err) {
        console.error("Failed to load sales data:", err);
        toast.error("Failed to load sales data");
      }
      
      // Load transaction data
      try {
        const data = await api.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to load transactions:", err);
        toast.error("Failed to load transactions data");
      }
      
      // Ensure we see all orders (useful when admin logs in after new tenants create orders)
      api.ensureOrdersVisibleToAdmin();
    };
    
    loadAdminData();
    
    // Set up subscriptions for real-time updates
    const adminUpdateSubscription = api.subscribeToAdminUpdates((data) => {
      // Handle different update types
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED') {
        updateOrdersData();
        updateMetricsData();
      } else if (data.type === 'USER_CREATED' || data.type === 'USER_UPDATED') {
        updateMetricsData();
        
        // Add user registration/update activity
        const userActivity: ActivityItem = {
          id: `user-${Date.now()}`,
          type: 'user_registered',
          message: `New user registered: ${data.user?.name || 'Unknown'}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: data.user?.id,
          userName: data.user?.name
        };
        
        setActivities(prev => [userActivity, ...prev]);
        
        // Create notification
        notifications.addNotification(
          'New User Registration',
          `${data.user?.name || 'Someone new'} just created an account!`,
          { type: 'info', showToast: true }
        );
      } else if (data.type === 'SALES_UPDATED') {
        setSalesData(data.sales);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      adminUpdateSubscription();
    };
  }, [notifications]);

  // Handle assigning evaluator to order
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      
      // Create notification for status update
      notifications.addNotification(
        'Order Status Updated',
        `Order #${orderId} status changed to ${newStatus}`,
        { type: 'success', showToast: true }
      );
      
      // Refresh pending orders
      updateOrdersData();
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update order status");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Scrollable main content */}
        <div className="flex-1 overflow-auto pb-8">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <AdminHeader 
              userName="Admin" 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            {/* Main dashboard grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              {/* First column: sidebar-like content */}
              <div className="lg:col-span-3 space-y-4">
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
                  totalRevenue={completedOrders.reduce((sum, order) => sum + order.totalPrice, 0)}
                  evaluationCompletionRate={metrics ? 
                    Math.round((metrics.completedOrderCount / (metrics.orderCount || 1)) * 100) : 0}
                />
                
                {/* AI Outreach Stats */}
                <AIOutreachStats />
                
                {/* Recent activity feed */}
                <RecentActivityFeed 
                  activities={activities} 
                  className="h-full" 
                />
              </div>
              
              {/* Main content area */}
              <div className="lg:col-span-9 space-y-6">
                {/* Top row - Key metrics cards */}
                <KeyMetricsCards orders={pendingOrders as any} />
                
                {/* Second row - Charts section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <SalesChart />
                  </div>
                  <div className="md:col-span-1">
                    <CostBreakdown />
                  </div>
                </div>
                
                {/* Third row - Activity and heatmap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ActivityCards completedOrders={completedOrders as any} />
                  <PropertyHeatmap className="h-full" />
                </div>
                
                {/* Fourth row - Pending orders with evaluator assignment */}
                <PendingOrders 
                  pendingOrders={pendingOrders} 
                  evaluators={evaluators}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
                
                {/* Fifth row - Pending inquiries */}
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
