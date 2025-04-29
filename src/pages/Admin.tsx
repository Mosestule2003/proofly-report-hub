
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileText, 
  Loader2, 
  CheckCircle,
  Building,
  LayoutDashboard,
  Calendar,
  MapPin,
  FileImage,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  Users,
  User,
  Phone,
  Mail,
  Briefcase,
  Search,
  ArrowUp,
  ArrowDown,
  Wrench,
  CircleDollarSign,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { formatTimeToNow } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/context/AuthContext';
import { api, Order, AdminMetrics } from '@/services/api';
import AdminMetricsComponent from '@/components/AdminMetrics';
import PropertyMap from '@/components/PropertyMap';
import EvaluatorProfile, { Evaluator } from '@/components/EvaluatorProfile';
import notificationService from '@/utils/notificationService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts
const pieData = [
  { name: 'Maintenance', value: 2500, color: '#9eceac' },
  { name: 'Repair', value: 1000, color: '#e6d9ac' },
  { name: 'Taxes', value: 800, color: '#afc4e6' },
  { name: 'Saving', value: 450, color: '#bfadd3' },
];

const barData = [
  { name: 'Mon', value: 2200 },
  { name: 'Tue', value: 2800 },
  { name: 'Wed', value: 3000 },
  { name: 'Thu', value: 4000 },
  { name: 'Fri', value: 2800 },
  { name: 'Sat', value: 2600 },
  { name: 'Sun', value: 2500 },
];

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [expandedProperties, setExpandedProperties] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state for report submission
  const [reportComments, setReportComments] = useState('');
  const [reportImageUrl, setReportImageUrl] = useState('');
  const [reportVideoUrl, setReportVideoUrl] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
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
  
  const togglePropertyExpand = (propertyId: string) => {
    setExpandedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };
  
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId);
  };
  
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
  
  const handleSubmitReport = async () => {
    if (!activeOrder) return;
    
    if (!reportComments.trim()) {
      toast.error("Report comments are required");
      return;
    }
    
    setIsSubmittingReport(true);
    
    try {
      await api.createReport(
        activeOrder.id,
        reportComments,
        reportImageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
        reportVideoUrl
      );
      
      // Update local order data
      const updatedOrder = await api.getOrderById(activeOrder.id);
      if (updatedOrder) {
        setOrders(prev => 
          prev.map(order => 
            order.id === activeOrder.id ? updatedOrder : order
          )
        );
      }
      
      // Notify the user about report completion
      notificationService.broadcast({
        id: crypto.randomUUID(),
        title: "Report Completed",
        message: `The evaluation report for order #${activeOrder.id.substring(0, 8)} is now ready to view.`,
        date: new Date(),
        read: false,
        type: 'success',
      });
      
      toast.success("Report submitted successfully");
      setReportDialogOpen(false);
      
      // Reset form
      setReportComments('');
      setReportImageUrl('');
      setReportVideoUrl('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmittingReport(false);
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Hello, {user?.name || "Admin"}!</h1>
            <p className="text-muted-foreground">Explore information and activity about properties</p>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search anything..." 
              className="pl-10 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Properties</p>
                    <h2 className="text-3xl font-bold">{orders.reduce((acc, order) => acc + order.properties.length, 0)}</h2>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    <span>20%</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Last month: {Math.floor(orders.reduce((acc, order) => acc + order.properties.length, 0) * 0.8)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Number of Evaluations</p>
                    <h2 className="text-3xl font-bold">{orders.length}</h2>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                    <ArrowDown className="h-3 w-3" />
                    <span>10%</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Last month: {Math.floor(orders.length * 1.1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
                    <CircleDollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <h2 className="text-3xl font-bold">${orders.reduce((acc, order) => acc + order.totalPrice, 0)}</h2>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    <span>15%</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Last month: ${Math.floor(orders.reduce((acc, order) => acc + order.totalPrice, 0) * 0.85)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Report Sales</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-muted">Weekday</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value}`, 'Value']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem',
                      padding: '0.5rem'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#9b87f5" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Cost Breakdown</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7">See Details</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value}`, 'Value']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        padding: '0.5rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-muted-foreground text-sm">Total</p>
                  <p className="text-2xl font-bold">$4,750</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Last Transactions</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7">See All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}`} 
                          alt="Property" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa";
                          }} 
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {order.properties[0].address.split(',')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "d MMM yyyy, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">${order.totalPrice}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Maintenance Requests</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7">See All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-primary">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Plumbing | 721 Meadowview</p>
                      <p className="text-xs text-muted-foreground">Request ID: MS-001</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Issue</p>
                      <p className="text-sm">Broken Garbage</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-primary">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Electrical | 721 Meadowview</p>
                      <p className="text-xs text-muted-foreground">Request ID: MS-002</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Issue</p>
                      <p className="text-sm">No Heat Bathroom</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://randomuser.me/api/portraits/men/44.jpg" />
                      <AvatarFallback>AF</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-primary">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">HVAC | 721 Meadowview</p>
                      <p className="text-xs text-muted-foreground">Request ID: MS-003</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Issue</p>
                      <p className="text-sm">Non Functional Fan</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://randomuser.me/api/portraits/men/55.jpg" />
                      <AvatarFallback>RF</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
            <Card>
              <CardHeader>
                <CardTitle>Pending Evaluation Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingOrders.length === 0 ? (
                  <div className="py-8 text-center">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No pending orders at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map(order => (
                      <Card key={order.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                Order #{order.id.substring(0, 8)}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.createdAt), 'MMM d, yyyy')} • 
                                {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                              </p>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          {/* Properties */}
                          <div className="space-y-3">
                            {order.properties.map(property => (
                              <div key={property.id} className="border rounded-md p-3">
                                <div 
                                  className="flex justify-between items-start cursor-pointer"
                                  onClick={() => togglePropertyExpand(property.id)}
                                >
                                  <div>
                                    <p className="font-medium">{property.address}</p>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {expandedProperties.includes(property.id) 
                                      ? <ChevronUp className="h-4 w-4" />
                                      : <ChevronDown className="h-4 w-4" />
                                    }
                                  </Button>
                                </div>
                                
                                {expandedProperties.includes(property.id) && (
                                  <div className="mt-3 space-y-2">
                                    <div className="bg-muted/30 p-3 rounded-md">
                                      <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span className="text-sm">{property.address}</span>
                                      </div>
                                      {property.description && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                          {property.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Agent/Landlord Contact */}
                          {order.agentContact && (
                            <div className="mt-4">
                              <h3 className="text-sm font-medium mb-2">Agent/Landlord Contact</h3>
                              <div className="bg-muted/20 p-3 rounded-md border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Name</p>
                                      <p className="text-sm">{order.agentContact.name}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Email</p>
                                      <p className="text-sm">{order.agentContact.email}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Phone</p>
                                      <p className="text-sm">{order.agentContact.phone}</p>
                                    </div>
                                  </div>
                                  
                                  {order.agentContact.company && (
                                    <div className="flex items-center">
                                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Company</p>
                                        <p className="text-sm">{order.agentContact.company}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Evaluator Assignment */}
                          <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2">Assign Evaluator</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {evaluators.map(evaluator => (
                                <div 
                                  key={evaluator.id} 
                                  className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                                    selectedEvaluator === evaluator.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                  }`}
                                  onClick={() => setSelectedEvaluator(evaluator.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                                      {evaluator.avatarUrl ? (
                                        <img src={evaluator.avatarUrl} alt={evaluator.name} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                          {evaluator.name.substring(0, 2)}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{evaluator.name}</p>
                                      <div className="flex items-center">
                                        <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`h-2 w-2 ${
                                              i < Math.floor(evaluator.rating) ? 'bg-amber-500' : 'bg-muted'
                                            } rounded-full mr-0.5`} />
                                          ))}
                                        </div>
                                        <span className="text-xs text-muted-foreground ml-1">
                                          {evaluator.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="ml-auto" 
                            onClick={() => {
                              handleUpdateStatus(order.id, 'Evaluator Assigned');
                              setSelectedEvaluator(null);
                            }}
                            disabled={!selectedEvaluator}
                          >
                            Assign & Accept Order
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assigned">
            <Card>
              <CardHeader>
                <CardTitle>In Progress Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                {assignedOrders.length === 0 ? (
                  <div className="py-8 text-center">
                    <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No orders in progress</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedOrders.map(order => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                Order #{order.id.substring(0, 8)}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.createdAt), 'MMM d, yyyy')} • 
                                {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline"
                                className={order.status === 'In Progress' 
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                                }
                              >
                                {order.status}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => toggleOrderExpand(order.id)}
                              >
                                {expandedOrder === order.id 
                                  ? <ChevronUp className="h-4 w-4" />
                                  : <ChevronDown className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className={`pb-2 ${expandedOrder === order.id ? 'block' : 'hidden'}`}>
                          <div className="space-y-3 mb-4">
                            {/* Assigned Evaluator */}
                            {order.evaluator && (
                              <div className="border rounded-md p-3 mb-4">
                                <h4 className="font-medium mb-2">Assigned Evaluator</h4>
                                <EvaluatorProfile evaluator={order.evaluator} />
                              </div>
                            )}
                            
                            {/* Agent/Landlord Contact */}
                            {order.agentContact && (
                              <div className="border rounded-md p-3 mb-4">
                                <h4 className="font-medium mb-2">Agent/Landlord Contact</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Name</p>
                                      <p className="text-sm">{order.agentContact.name}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Email</p>
                                      <p className="text-sm">{order.agentContact.email}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Phone</p>
                                      <p className="text-sm">{order.agentContact.phone}</p>
                                    </div>
                                  </div>
                                  
                                  {order.agentContact.company && (
                                    <div className="flex items-center">
                                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Company</p>
                                        <p className="text-sm">{order.agentContact.company}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Current progress */}
                            <div className="border rounded-md p-3">
                              <div className="flex justify-between items-center mb-2">
                                <p className="font-medium">Evaluation Progress</p>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {order.currentStep?.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              
                              {order.currentPropertyIndex !== undefined && order.properties.length > 0 && (
                                <div className="space-y-4">
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>
                                      Property {order.currentPropertyIndex + 1} of {order.properties.length}
                                    </span>
                                  </div>
                                  
                                  {/* Map of current property */}
                                  <PropertyMap 
                                    properties={order.properties}
                                    currentPropertyIndex={order.currentPropertyIndex}
                                    currentStep={
                                      order.currentStep === 'EN_ROUTE' ? 0 : 
                                      order.currentStep === 'ARRIVED' ? 1 : 
                                      order.currentStep === 'EVALUATING' ? 2 : 3
                                    }
                                    evaluator={order.evaluator}
                                    className="h-64"
                                    showAllProperties={true}
                                    interactive={true}
                                  />
                                  
                                  <div className="flex justify-between mt-2">
                                    <p className="text-sm font-medium">
                                      {order.properties[order.currentPropertyIndex].address}
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleAdvanceOrderStep(order.id)}
                                      className="h-8"
                                    >
                                      <RefreshCw className="h-3 w-3 mr-2" />
                                      Advance Step
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* All properties */}
                            <h4 className="font-medium mt-4 mb-2">All Properties</h4>
                            <div className="space-y-2">
                              {order.properties.map((property, index) => (
                                <div 
                                  key={property.id} 
                                  className={`border rounded p-3 ${
                                    index === order.currentPropertyIndex ? 'bg-primary/5 border-primary' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className={`h-2 w-2 rounded-full mr-2 ${
                                        index < (order.currentPropertyIndex || 0) ? 'bg-green-500' : 
                                        index === (order.currentPropertyIndex || 0) ? 'bg-primary animate-pulse' : 
                                        'bg-muted-foreground/30'
                                      }`}></div>
                                      <span className={`${
                                        index === order.currentPropertyIndex ? 'font-medium' : ''
                                      }`}>
                                        {property.address}
                                      </span>
                                    </div>
                                    <Badge variant={index === order.currentPropertyIndex ? "default" : "outline"}>
                                      {index < (order.currentPropertyIndex || 0) ? 'Completed' : 
                                       index === (order.currentPropertyIndex || 0) ? 'Current' : 
                                       'Pending'}
                                    </Badge>
                                  </div>
                                  {property.description && (
                                    <p className="text-sm text-muted-foreground mt-2 ml-4">
                                      {property.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-4">
                          {order.status === 'Evaluator Assigned' && (
                            <Button 
                              variant="outline"
                              onClick={() => handleUpdateStatus(order.id, 'In Progress')}
                            >
                              Mark as In Progress
                            </Button>
                          )}
                          
                          <Dialog open={reportDialogOpen && activeOrder?.id === order.id} onOpenChange={(open) => {
                            setReportDialogOpen(open);
                            if (open) setActiveOrder(order);
                          }}>
                            <DialogTrigger asChild>
                              <Button className="ml-auto">Upload Report</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Upload Property Evaluation Report</DialogTitle>
                                <DialogDescription>
                                  Complete the evaluation report for order #{order.id.substring(0, 8)}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="comments">Evaluation Comments</Label>
                                  <Textarea
                                    id="comments"
                                    placeholder="Enter your detailed evaluation findings..."
                                    className="min-h-[150px]"
                                    value={reportComments}
                                    onChange={(e) => setReportComments(e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                                  <Input
                                    id="imageUrl"
                                    placeholder="https://example.com/image.jpg"
                                    value={reportImageUrl}
                                    onChange={(e) => setReportImageUrl(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Add a URL to a property image
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="videoUrl">Video URL (optional)</Label>
                                  <Input
                                    id="videoUrl"
                                    placeholder="https://example.com/video.mp4"
                                    value={reportVideoUrl}
                                    onChange={(e) => setReportVideoUrl(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Add a URL to a walkthrough video
                                  </p>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleSubmitReport}
                                  disabled={isSubmittingReport || !reportComments.trim()}
                                >
                                  {isSubmittingReport ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Submitting...
                                    </>
                                  ) : (
                                    'Submit Report'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                {completedOrders.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No completed evaluations yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedOrders.map(order => (
                      <Card key={order.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                Order #{order.id.substring(0, 8)}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Completed on {format(new Date(order.createdAt), 'MMM d, yyyy')} • 
                                {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Report Ready
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Assigned Evaluator */}
                          {order.evaluator && (
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                Evaluation by
                              </p>
                              <EvaluatorProfile evaluator={order.evaluator} variant="compact" />
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 mb-4 text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>Report Complete</span>
                            </div>
                            <div className="flex items-center">
                              <FileImage className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>Images Available</span>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="grid grid-cols-2 gap-4">
                            {order.properties.slice(0, 4).map((property, index) => (
                              <div key={property.id} className="border rounded-md p-3">
                                <p className="font-medium truncate">{property.address}</p>
                              </div>
                            ))}
                          </div>
                          
                          {order.properties.length > 4 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              + {order.properties.length - 4} more properties
                            </p>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="ml-auto">
                            View Report
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
