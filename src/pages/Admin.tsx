
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, Order, AdminMetrics } from '@/services/api';
import { Evaluator } from '@/components/EvaluatorProfile';

// Import our components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import DashboardStats from '@/components/admin/DashboardStats';
import SalesChart from '@/components/admin/SalesChart';
import CostBreakdown from '@/components/admin/CostBreakdown';
import LastTransactions from '@/components/admin/LastTransactions';
import PendingInquiries from '@/components/admin/PendingInquiries';
import UsersList from '@/components/admin/UsersList';

// Import existing order detail components
import PendingOrders from '@/components/admin/PendingOrders';
import InProgressOrders from '@/components/admin/InProgressOrders';
import CompletedOrders from '@/components/admin/CompletedOrders';

// Import tracker for current order view
import PropertyEvaluationTracker from '@/components/PropertyEvaluationTracker';

// Tabs and dialog components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewingOrderDetails, setViewingOrderDetails] = useState(false);
  
  // Calculate total earnings from completed orders
  const totalEarnings = orders
    .filter(order => order.status === 'Report Ready')
    .reduce((sum, order) => sum + order.totalPrice, 0);
  
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
        // Refresh orders
        api.getOrders().then(updatedOrders => {
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
  
  // Filter orders by search term
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.properties.some(p => p.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.agentContact?.name && order.agentContact.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle order status updates
  const handleUpdateStatus = async (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, newStatus);
      
      if (updatedOrder) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? updatedOrder : order
          )
        );
        
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error("Failed to update order status");
    }
  };
  
  // Handle order step advancement
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
        
        toast.success(`Advanced order to next step`);
        
        // If viewing this order, update the selected order
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Error advancing order step:', error);
      toast.error("Failed to advance order step");
    }
  };
  
  // Handle report submission
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
      
      toast.success("Report submitted successfully");
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("Failed to submit report");
      throw error;
    }
  };
  
  // View transaction details
  const handleViewTransaction = (orderId: string) => {
    const order = orders.find(order => order.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setViewingOrderDetails(true);
    }
  };
  
  // Loading state
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
      {/* Left sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <div className="pl-64 min-h-screen">
        <div className="container py-6">
          {/* Top bar */}
          <AdminTopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          {/* Stats cards */}
          <DashboardStats 
            totalOrders={orders.length} 
            completedEvaluations={completedOrders.length}
            totalEarnings={totalEarnings}
          />
          
          {/* Charts and transactions section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SalesChart />
            <CostBreakdown />
          </div>
          
          {/* Users section */}
          <div className="mb-6">
            <UsersList />
          </div>
          
          {/* Transactions and inquiries section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <LastTransactions 
              transactions={orders} 
              onViewTransaction={handleViewTransaction}
            />
            <PendingInquiries />
          </div>
          
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
      
      {/* Order detail dialog */}
      <Dialog open={viewingOrderDetails} onOpenChange={setViewingOrderDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.substring(0, 8) || ''}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="mt-4">
              <PropertyEvaluationTracker order={selectedOrder} />
              
              <div className="mt-6 flex justify-end">
                {selectedOrder.status !== 'Report Ready' && (
                  <button 
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                    onClick={() => handleAdvanceOrderStep(selectedOrder.id)}
                  >
                    Advance to Next Step
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
