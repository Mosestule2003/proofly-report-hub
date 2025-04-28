
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
  ChevronUp
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
import { api, Order } from '@/services/api';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [expandedProperties, setExpandedProperties] = useState<string[]>([]);
  
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
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate, isLoading]);
  
  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!user || user.role !== 'admin') return;
      
      try {
        // Initialize mock data
        api.initMockData(user);
        
        // Get all orders (admin has access to all)
        const allOrders = await api.getOrders();
        setOrders(allOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, [user]);
  
  const togglePropertyExpand = (propertyId: string) => {
    setExpandedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
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
      
      <Tabs defaultValue="pending" className="space-y-4">
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
                          <Badge 
                            variant="outline"
                            className={order.status === 'In Progress' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-3">
                          {order.properties.slice(0, 2).map(property => (
                            <div key={property.id} className="border rounded-md p-3">
                              <p className="font-medium">{property.address}</p>
                              {property.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {property.description}
                                </p>
                              )}
                            </div>
                          ))}
                          
                          {order.properties.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              + {order.properties.length - 2} more properties
                            </p>
                          )}
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
