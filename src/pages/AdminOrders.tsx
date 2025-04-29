
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
import { Eye } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        const allOrders = await api.getOrders();
        setOrders(allOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
    
    // Subscribe to WebSocket updates
    const unsubscribe = api.subscribeToAdminUpdates((data) => {
      // Handle different types of updates
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED' || data.type === 'ORDER_STEP_UPDATE') {
        // Refresh orders
        api.getOrders().then(updatedOrders => {
          setOrders(updatedOrders);
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

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Evaluator Assigned': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Report Ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // View details handler
  const handleViewDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
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
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
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
                      <TableHead>Properties</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                          <TableCell>
                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
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
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDetails(order.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
