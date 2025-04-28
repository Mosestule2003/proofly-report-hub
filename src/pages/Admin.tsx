import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
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
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext';
import { api, Order, AdminMetrics } from '@/services/api';
import AdminMetricsComponent from '@/components/AdminMetrics';
import PropertyMap from '@/components/PropertyMap';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [expandedProperties, setExpandedProperties] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
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
  
  // Load orders and metrics
  useEffect(() => {
    const loadData = async () => {
      if (!user || user.role !== 'admin') return;
      
      setIsLoading(true);
      
      try {
        // Initialize mock data
        api.initMockData(user);
        
        // Ensure all orders are visible to admin
        api.ensureOrdersVisibleToAdmin();
        
        // Get all orders (admin has access to all)
        const [allOrders, adminMetrics] = await Promise.all([
          api.getOrders(), // No userId means get all orders
          api.getAdminMetrics()
        ]);
        
        setOrders(allOrders);
        setMetrics(adminMetrics);
        
        console.log(`Admin dashboard loaded with ${allOrders.length} orders`);
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
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const assignedOrders = orders.filter(o => ['Evaluator Assigned', 'In Progress'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'Report Ready');
  
  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      {metrics && <AdminMetricsComponent {...metrics} />}
      
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
              <CardDescription>
                New requests that need to be assigned to an evaluator
              </CardDescription>
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
                            <CardDescription>
                              {format(new Date(order.createdAt), 'MMM d, yyyy')} • 
                              {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
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
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="ml-auto" 
                          onClick={() => handleUpdateStatus(order.id, 'Evaluator Assigned')}
                        >
                          Accept Order
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
              <CardDescription>
                Orders that have been assigned and are being evaluated
              </CardDescription>
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
                            <CardDescription>
                              {format(new Date(order.createdAt), 'MMM d, yyyy')} • 
                              {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                            </CardDescription>
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
                                  property={order.properties[order.currentPropertyIndex]}
                                  currentStep={
                                    order.currentStep === 'EN_ROUTE' ? 0 : 
                                    order.currentStep === 'ARRIVED' ? 1 : 
                                    order.currentStep === 'EVALUATING' ? 2 : 3
                                  }
                                />
                                
                                <div className="flex justify-between">
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
                          <p className="font-medium mt-4 mb-2">All Properties</p>
                          {order.properties.map((property, index) => (
                            <div key={property.id} className="border rounded-md p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`h-2 w-2 rounded-full mr-2 ${
                                    index < (order.currentPropertyIndex || 0) ? 'bg-green-500' : 
                                    index === (order.currentPropertyIndex || 0) ? 'bg-primary animate-pulse' : 
                                    'bg-muted-foreground/30'
                                  }`}></div>
                                  <p className="font-medium">{property.address}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ${property.price}
                                </span>
                              </div>
                              {property.description && (
                                <p className="text-sm text-muted-foreground mt-1 ml-4">
                                  {property.description}
                                </p>
                              )}
                            </div>
                          ))}
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
              <CardDescription>
                Orders with completed reports
              </CardDescription>
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
                            <CardDescription>
                              Completed on {format(new Date(order.createdAt), 'MMM d, yyyy')} • 
                              {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Report Ready
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
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
  );
};

export default Admin;
