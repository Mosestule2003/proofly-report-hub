
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Order, api } from '@/services/api';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Eye, Edit, Check } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderCount, setOrderCount] = useState(0);

  // Protect route - only admins can access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast.error("Unauthorized access");
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  // Load all orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!user || user.role !== 'admin') return;
      setIsLoading(true);
      
      try {
        // Initialize mock data to ensure test orders exist
        await api.initMockData(user);
        
        // Get all orders from the API
        const allOrders = await api.getOrders();
        console.log("Admin Orders: Retrieved orders:", allOrders);
        
        // Sort orders by date (newest first)
        const sortedOrders = [...allOrders].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setOrders(sortedOrders);
        setOrderCount(sortedOrders.length);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();

    // Subscribe to WebSocket updates
    const unsubscribe = api.subscribeToAdminUpdates(data => {
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED' || data.type === 'ORDER_STEP_UPDATE') {
        // Refresh orders
        api.getOrders().then(updatedOrders => {
          const sortedOrders = [...updatedOrders].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setOrders(sortedOrders);
          setOrderCount(sortedOrders.length);
        });

        // Show a toast notification for new orders
        if (data.type === 'ORDER_CREATED') {
          toast.success(`New order received! Order #${data.order.id.substring(0, 8)}`);
        }
      }
    });

    // Ensure all orders are visible to admin
    api.ensureOrdersVisibleToAdmin();

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [user]);

  // Filter orders by search term
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.properties.some(p => p.address.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (order.agentContact?.name && order.agentContact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getUserName(order.userId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get user name from userId
  const getUserName = (userId: string): string => {
    // This will be replaced with actual user lookup in a real app
    const user = orders.find(order => order.userId === userId)?.agentContact?.name;
    return user || "Unknown User";
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Evaluator Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Report Ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // View details handler
  const handleViewDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  // Advance order status handler
  const handleAdvanceOrderStatus = async (orderId: string) => {
    try {
      await api.advanceOrderStep(orderId);
      toast.success("Order status advanced successfully");
    } catch (error) {
      console.error('Error advancing order status:', error);
      toast.error("Failed to advance order status");
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Left sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <div className="pl-64 min-h-screen">
        <div className="container py-6">
          {/* Top bar */}
          <AdminTopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          {/* Orders List */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>All Orders ({orderCount})</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Managing orders from all users
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {getUserName(order.userId)}
                          </TableCell>
                          <TableCell>
                            {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                          </TableCell>
                          <TableCell>
                            {order.agentContact?.name || 'N/A'}
                          </TableCell>
                          <TableCell>${order.totalPrice}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleViewDetails(order.id)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleAdvanceOrderStatus(order.id)}
                                title="Advance status"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
