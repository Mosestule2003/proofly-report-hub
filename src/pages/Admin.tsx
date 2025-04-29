
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { api, Order, AdminMetrics } from '@/services/api';
import { Evaluator } from '@/components/EvaluatorProfile';
import notificationService from '@/utils/notificationService';

// Import our new components
import AdminHeader from '@/components/admin/AdminHeader';
import KeyMetricsCards from '@/components/admin/KeyMetricsCards';
import ChartsSection from '@/components/admin/ChartsSection';
import ActivityCards from '@/components/admin/ActivityCards';
import PendingOrders from '@/components/admin/PendingOrders';
import InProgressOrders from '@/components/admin/InProgressOrders';
import CompletedOrders from '@/components/admin/CompletedOrders';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Protect route - only admins can access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast.error("Unauthorized access");
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate, isLoading]);
  
  // Load orders, metrics and evaluators
  useEffect(() => {
    const loadData = async () => {
      if (!user || user.role !== 'admin') return;
      
      setIsLoading(true);
      
      try {
        // Initialize mock data
        api.initMockData(user);
        
        // Ensure all orders are visible to admin
        api.ensureOrdersVisibleToAdmin();
        
        // Get all orders and data (admin has access to all)
        const [allOrders, adminMetrics, allEvaluators] = await Promise.all([
          api.getOrders(), // No userId means get all orders
          api.getAdminMetrics(),
          api.getAllEvaluators()
        ]);
        
        setOrders(allOrders);
        setMetrics(adminMetrics);
        setEvaluators(allEvaluators);
        
        console.log(`Admin dashboard loaded with ${allOrders.length} orders and ${allEvaluators.length} evaluators`);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error("Failed to load admin data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Subscribe to WebSocket updates
    const unsubscribe = api.subscribeToAdminUpdates((data) => {
      // Handle different types of updates
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED' || data.type === 'ORDER_STEP_UPDATE') {
        console.log('Admin received update:', data);
        
        // Refresh orders
        api.getOrders().then(updatedOrders => {
          console.log(`Admin dashboard refreshed with ${updatedOrders.length} orders`);
          setOrders(updatedOrders);
        });
        
        // Refresh metrics
        api.getAdminMetrics().then(updatedMetrics => {
          setMetrics(updatedMetrics);
        });
        
        // Show a toast notification for new orders
        if (data.type === 'ORDER_CREATED') {
          toast.success(`New order received! Order #${data.order.id.substring(0, 8)}`);
        }
      }
    });
    
    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  const handleUpdateStatus = async (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, newStatus);
      
      if (updatedOrder) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? updatedOrder : order
          )
        );
        
        // Create and broadcast a notification to the user
        notificationService.broadcast({
          id: crypto.randomUUID(),
          title: `Order ${newStatus}`,
          message: `Your order #${orderId.substring(0, 8)} has been updated to ${newStatus}`,
          date: new Date(),
          read: false,
          type: 'info',
        });
        
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error("Failed to update order status");
    }
  };
  
  const handleAdvanceOrderStep = async (orderId: string) => {
    try {
      const updatedOrder = await api.advanceOrderStep(orderId);
      
      if (updatedOrder) {
        // Update orders with the new data
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? updatedOrder : order
          )
        );
        
        // Broadcast notification to the user about the status change
        notificationService.broadcast({
          id: crypto.randomUUID(),
          title: `Order Step Updated`,
          message: `Your order #${orderId.substring(0, 8)} has advanced to the next step`,
          date: new Date(),
          read: false,
          type: 'info',
        });
        
        toast.success(`Advanced order to next step`);
      }
    } catch (error) {
      console.error('Error advancing order step:', error);
      toast.error("Failed to advance order step");
    }
  };
  
  const handleSubmitReport = async (orderId: string, comments: string, imageUrl: string, videoUrl: string) => {
    try {
      await api.createReport(
        orderId,
        comments,
        imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
        videoUrl
      );
      
      // Update local order data
      const updatedOrder = await api.getOrderById(orderId);
      if (updatedOrder) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? updatedOrder : order
          )
        );
      }
      
      // Notify the user about report completion
      notificationService.broadcast({
        id: crypto.randomUUID(),
        title: "Report Completed",
        message: `The evaluation report for order #${orderId.substring(0, 8)} is now ready to view.`,
        date: new Date(),
        read: false,
        type: 'success',
      });
      
      toast.success("Report submitted successfully");
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("Failed to submit report");
      throw error;
    }
  };
  
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.properties.some(p => p.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Loading admin dashboard...</h2>
        </div>
      </div>
    );
  }
  
  // Filter orders by status
  const pendingOrders = filteredOrders.filter(o => o.status === 'Pending');
  const assignedOrders = filteredOrders.filter(o => ['Evaluator Assigned', 'In Progress'].includes(o.status));
  const completedOrders = filteredOrders.filter(o => o.status === 'Report Ready');
  
  return (
    <div className="bg-background min-h-screen">
      <div className="container py-6">
        {/* Header */}
        <AdminHeader 
          userName={user?.name} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
        />
        
        {/* Key Metrics */}
        <KeyMetricsCards orders={orders} />
        
        {/* Charts Section */}
        <ChartsSection />
        
        {/* Recent Activity Sections */}
        <ActivityCards completedOrders={completedOrders} />
        
        {/* Order Management */}
        <Tabs defaultValue="pending" className="space-y-4 mt-8">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending Orders
              {pendingOrders.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-[20px] inline-flex items-center justify-center px-1">
                  {pendingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="assigned" className="relative">
              In Progress
              {assignedOrders.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-[20px] inline-flex items-center justify-center px-1">
                  {assignedOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <PendingOrders 
              pendingOrders={pendingOrders}
              evaluators={evaluators}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
          
          <TabsContent value="assigned">
            <InProgressOrders 
              assignedOrders={assignedOrders}
              onUpdateStatus={handleUpdateStatus}
              onAdvanceOrderStep={handleAdvanceOrderStep}
              onSubmitReport={handleSubmitReport}
            />
          </TabsContent>
          
          <TabsContent value="completed">
            <CompletedOrders
              completedOrders={completedOrders}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
