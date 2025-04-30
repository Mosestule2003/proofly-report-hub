
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
import LastTransactions from '@/components/admin/LastTransactions';
import { api } from '@/services/api';

// Define the types we need since they're not exported from the API
interface Evaluator {
  id: string;
  name: string;
  rating: number;
  completedEvaluations: number;
  availability: 'Available' | 'Busy';
  specialization: string;
}

interface Order {
  id: string;
  tenantName: string;
  propertyAddress: string;
  date: string;
  status: string;
  amount: number;
  rating?: number;
}

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

// Sample activity data
const activityData = [
  {
    id: '1',
    user: 'John Smith',
    action: 'created an evaluation order',
    target: '123 Main St. Apartment',
    time: '2 hours ago'
  },
  {
    id: '2',
    user: 'Sarah Johnson',
    action: 'scheduled a viewing',
    target: '456 Park Ave Condo',
    time: '4 hours ago'
  },
  {
    id: '3',
    user: 'Michael Brown',
    action: 'completed a payment',
    target: '$249.99',
    time: '5 hours ago'
  },
  {
    id: '4',
    user: 'Emily Davis',
    action: 'submitted feedback',
    target: 'Evaluator Report #4592',
    time: '1 day ago'
  },
  {
    id: '5',
    user: 'Robert Wilson',
    action: 'requested evaluation',
    target: '789 Ocean Blvd House',
    time: '1 day ago'
  }
];

// Sample orders data for components that need it
const sampleOrders = [
  {
    id: "ord-1",
    userId: "user-1",
    properties: [{ id: "prop-1", address: "123 Main St", city: "San Francisco" }],
    totalPrice: 149.99,
    status: "Completed",
    discount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "ord-2",
    userId: "user-2",
    properties: [{ id: "prop-2", address: "456 Broadway", city: "New York" }],
    totalPrice: 199.99,
    status: "In Progress",
    discount: 10,
    createdAt: new Date().toISOString()
  }
];

// Sample activity items in the correct format
const formattedActivityItems = activityData.map(item => ({
  id: item.id,
  type: 'order',
  message: `${item.user} ${item.action} ${item.target}`,
  timestamp: new Date().toISOString(),
  read: false
}));

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetricsType | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Check if mobile on mount and whenever window resizes
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    // Load admin metrics
    api.getAdminMetrics()
      .then(data => {
        setMetrics(data);
      })
      .catch(err => {
        console.error("Failed to load admin metrics:", err);
        // Set default metrics if API fails
        setMetrics({
          tenantCount: 0,
          orderCount: 0,
          pendingOrderCount: 0,
          completedOrderCount: 0
        });
      });
    
    // Load orders for the pending orders widget and other components
    api.getOrders()
      .then(apiOrders => {
        // Store all orders for components that need them
        setOrders(apiOrders);
        
        // Filter pending orders
        const pending = apiOrders.filter((order: any) => order.status === 'Pending')
          .map((order: any) => ({
            id: order.id,
            tenantName: order.userName || 'Unknown Tenant',
            propertyAddress: order.properties?.[0]?.address || 'Unknown Address',
            date: order.createdAt,
            status: order.status,
            amount: order.totalPrice
          }));
        
        setPendingOrders(pending);
      })
      .catch(err => {
        console.error("Failed to load orders:", err);
        setPendingOrders([]);
        setOrders(sampleOrders);
      });
    
    // Load evaluators for the assignment widget
    api.getAllEvaluators()
      .then(data => {
        const formattedEvaluators = data.map((evaluator: any) => ({
          id: evaluator.id,
          name: evaluator.name,
          rating: evaluator.rating || 4.5,
          completedEvaluations: evaluator.evaluationsCompleted || 0,
          availability: evaluator.status === 'Available' ? 'Available' : 'Busy',
          specialization: evaluator.specialty || 'General'
        }));
        
        setEvaluators(formattedEvaluators);
      })
      .catch(err => {
        console.error("Failed to load evaluators:", err);
        setEvaluators([]);
      });
    
    // Load sales data for charts
    api.getSalesData()
      .then(data => {
        setSalesData(data);
      })
      .catch(err => {
        console.error("Failed to load sales data:", err);
        setSalesData([]);
      });
      
    // Load transaction data for LastTransactions component
    api.getTransactions()
      .then(data => {
        setTransactions(data);
      })
      .catch(err => {
        console.error("Failed to load transactions:", err);
        setTransactions([]);
      });
    
    // Subscribe to admin updates
    const unsubscribe = api.subscribeToAdminUpdates((data) => {
      // Handle different update types
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED') {
        // Refresh orders when there's an update
        api.getOrders()
          .then(apiOrders => {
            setOrders(apiOrders);
            const pending = apiOrders.filter((order: any) => order.status === 'Pending')
              .map((order: any) => ({
                id: order.id,
                tenantName: order.userName || 'Unknown Tenant',
                propertyAddress: order.properties?.[0]?.address || 'Unknown Address',
                date: order.createdAt,
                status: order.status,
                amount: order.totalPrice
              }));
            setPendingOrders(pending);
          })
          .catch(err => {
            console.error("Failed to refresh orders:", err);
          });
      }
    });
    
    // Ensure we see all orders (useful when admin logs in after new tenants create orders)
    api.ensureOrdersVisibleToAdmin();
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle assigning evaluator to order
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      // Refresh pending orders
      const allOrders = await api.getOrders();
      setOrders(allOrders);
      const pending = allOrders.filter((order: any) => order.status === 'Pending')
        .map((order: any) => ({
          id: order.id,
          tenantName: order.userName || 'Unknown Tenant',
          propertyAddress: order.properties?.[0]?.address || 'Unknown Address',
          date: order.createdAt,
          status: order.status,
          amount: order.totalPrice
        }));
      setPendingOrders(pending);
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

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
                  totalOrders={orders?.length || 0}
                  evaluationsInProgress={orders?.filter((o: any) => o.status === 'In Progress')?.length || 0}
                  totalRevenue={orders?.reduce((acc: number, order: any) => acc + (order.totalPrice || 0), 0) || 0}
                  evaluationCompletionRate={orders?.length ? (orders.filter((o: any) => o.status === 'Completed').length / orders.length) * 100 : 0}
                />
                
                {/* Transactions */}
                <LastTransactions transactions={transactions} />
                
                {/* AI Outreach Stats */}
                <AIOutreachStats />
              </div>
              
              {/* Second column: 2/3 width on large screens */}
              <div className="lg:col-span-2 space-y-6">
                {/* Key metrics cards */}
                <KeyMetricsCards orders={orders || []} />
                
                {/* Charts */}
                <SalesChart />
                
                {/* Activity cards */}
                <ActivityCards completedOrders={orders?.filter((o: any) => o.status === 'Completed') || []} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent activity feed */}
                  <RecentActivityFeed activities={formattedActivityItems} className="h-full" />
                  
                  {/* Property heatmap */}
                  <PropertyHeatmap className="h-full" />
                </div>
                
                {/* Pending orders with evaluator assignment */}
                <PendingOrders 
                  pendingOrders={pendingOrders} 
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
