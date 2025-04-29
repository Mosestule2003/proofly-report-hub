
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Loader2, 
  FileText, 
  AlertCircle, 
  ChevronRight, 
  Building,
  FileVideo,
  FileImage,
  ExternalLink,
  MapPin,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, Order, Report, OrderStepStatus } from '@/services/api';
import { format } from 'date-fns';
import PropertyMap from '@/components/PropertyMap';
import EvaluatorProfile from '@/components/EvaluatorProfile';
import NotificationBell, { Notification } from '@/components/NotificationBell';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Protect route
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isLoading]);
  
  // Load user data (orders and notifications)
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // Initialize sample data
        api.initMockData(user);
        
        // Load orders for user
        const userOrders = await api.getOrders(user.id);
        setOrders(userOrders);
        
        // Load notifications
        const userNotifications = await api.getNotifications(user.id);
        setNotifications(userNotifications);
        
        if (userOrders.length > 0) {
          // Select first order by default
          const firstCompletedOrder = userOrders.find(o => o.status === 'Report Ready');
          if (firstCompletedOrder) {
            setSelectedOrder(firstCompletedOrder);
            loadReport(firstCompletedOrder.id);
          } else {
            setSelectedOrder(userOrders[0]);
          }
        }
      } catch (error) {
        console.error('Error loading user data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
    
    // Subscribe to WebSocket updates for order status changes
    if (user) {
      // Subscribe to order updates
      const orderUnsubscribe = api.subscribeToOrders(user.id, (data) => {
        console.log('WebSocket order update:', data);
        
        // Handle order updates
        if (data.type === 'ORDER_UPDATED' || data.type === 'ORDER_STEP_UPDATE') {
          // Refresh order list
          api.getOrders(user.id).then(updatedOrders => {
            setOrders(updatedOrders);
            
            // If the currently selected order was updated, refresh it
            if (selectedOrder && data.orderId === selectedOrder.id) {
              const updatedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
              if (updatedOrder) {
                setSelectedOrder(updatedOrder);
                
                // If status changed to Report Ready, load the report
                if (updatedOrder.status === 'Report Ready' && selectedOrder.status !== 'Report Ready') {
                  loadReport(updatedOrder.id);
                }
              }
            }
          });
        }
        
        // Handle new report creation
        if (data.type === 'REPORT_CREATED' && selectedOrder && data.report.orderId === selectedOrder.id) {
          setReport(data.report);
        }
      });
      
      // Subscribe to notification updates
      const notificationUnsubscribe = api.subscribeToNotifications(user.id, (data) => {
        console.log('WebSocket notification update:', data);
        
        // Handle notification events
        if (data.type === 'NEW_NOTIFICATION') {
          setNotifications(prev => [data.notification, ...prev]);
        } else if (data.type === 'NOTIFICATION_READ') {
          setNotifications(prev => prev.map(
            n => n.id === data.notificationId ? { ...n, read: true } : n
          ));
        } else if (data.type === 'ALL_NOTIFICATIONS_READ') {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
      });
      
      // Cleanup subscriptions on unmount
      return () => {
        orderUnsubscribe();
        notificationUnsubscribe();
      };
    }
  }, [user, selectedOrder]);
  
  const loadReport = async (orderId: string) => {
    setIsLoadingReport(true);
    
    try {
      const reportData = await api.getReportForOrder(orderId);
      setReport(reportData);
    } catch (error) {
      console.error('Error loading report', error);
    } finally {
      setIsLoadingReport(false);
    }
  };
  
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    
    if (order.status === 'Report Ready') {
      loadReport(order.id);
    } else {
      setReport(null);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    await api.markNotificationAsRead(user.id, id);
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await api.markAllNotificationsAsRead(user.id);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }
  
  // Show empty state if no orders
  if (orders.length === 0) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <NotificationBell 
            notifications={notifications} 
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>
        
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <Building className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No property evaluations yet</h2>
            <p className="text-muted-foreground mb-6">
              Get started by adding properties for evaluation.
            </p>
            <Button onClick={() => navigate('/')}>
              Request Evaluation
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'Evaluator Assigned':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Evaluator Assigned</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">In Progress</Badge>;
      case 'Report Ready':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Report Ready</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Helper to get step message based on order status
  const getOrderStepMessage = (order: Order): string => {
    if (!order.currentStep) return '';
    
    const currentPropertyIndex = order.currentPropertyIndex || 0;
    const property = order.properties[currentPropertyIndex];
    const address = property ? property.address.split(',')[0] : ''; // Just the street for brevity
    
    switch (order.currentStep) {
      case 'PENDING_MATCH':
        return 'Finding an evaluator near you...';
      case 'EN_ROUTE':
        return `Evaluator en route to ${address}...`;
      case 'ARRIVED':
        return `Evaluator has arrived at ${address}...`;
      case 'EVALUATING':
        return `Evaluating property at ${address}...`;
      case 'COMPLETED':
        return `Evaluation completed for ${address}.`;
      case 'REPORT_READY':
        return 'Your evaluation report is ready!';
      default:
        return '';
    }
  };
  
  // Get which step is the order on
  const getCurrentStepNumber = (order: Order): number => {
    if (!order.currentStep) return 0;
    const steps: OrderStepStatus[] = ['PENDING_MATCH', 'EN_ROUTE', 'ARRIVED', 'EVALUATING', 'COMPLETED', 'REPORT_READY'];
    return steps.indexOf(order.currentStep);
  };

  // Get the map step number (0: en route, 1: arrived, 2: evaluating, 3: completed)
  const getMapStepNumber = (orderStep: OrderStepStatus | undefined): number => {
    if (!orderStep) return 0;
    
    switch (orderStep) {
      case 'EN_ROUTE': return 0;
      case 'ARRIVED': return 1;
      case 'EVALUATING': return 2;
      case 'COMPLETED': 
      case 'REPORT_READY': 
        return 3;
      default: return 0;
    }
  };
  
  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <NotificationBell 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>My Evaluations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {orders.map((order) => (
                  <Button
                    key={order.id}
                    variant="ghost"
                    className={`w-full justify-start px-4 py-6 h-auto rounded-none ${
                      selectedOrder?.id === order.id ? 'bg-secondary' : ''
                    }`}
                    onClick={() => handleSelectOrder(order)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">
                          Order #{order.id.substring(0, 8)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {getStatusBadge(order.status)}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-8">
          {selectedOrder && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order Details</CardTitle>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-medium">{selectedOrder.id.substring(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedOrder.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Properties</p>
                    <p className="font-medium">{selectedOrder.properties.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="font-medium">${selectedOrder.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Show agent/landlord contact if available */}
                {selectedOrder.agentContact && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                    <div className="bg-muted/20 rounded-lg p-4 border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{selectedOrder.agentContact.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedOrder.agentContact.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedOrder.agentContact.phone}</p>
                        </div>
                        {selectedOrder.agentContact.company && (
                          <div>
                            <p className="text-sm text-muted-foreground">Company</p>
                            <p className="font-medium">{selectedOrder.agentContact.company}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mb-3">Properties</h3>
                <div className="space-y-2 mb-6">
                  {selectedOrder.properties.map((property, index) => (
                    <div key={property.id} className={`border rounded-md p-3 ${
                      selectedOrder.currentPropertyIndex === index && 
                      selectedOrder.currentStep !== 'PENDING_MATCH' && 
                      selectedOrder.currentStep !== 'REPORT_READY' ? 
                        'border-primary bg-primary/5' : ''
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              selectedOrder.currentStep === 'REPORT_READY' || 
                              (selectedOrder.currentPropertyIndex !== undefined && 
                               index < selectedOrder.currentPropertyIndex) ? 'bg-green-500' : 
                              selectedOrder.currentPropertyIndex === index ? 'bg-primary animate-pulse' : 
                              'bg-gray-300'
                            }`}></div>
                            <p className="font-medium">{property.address}</p>
                          </div>
                          {property.description && (
                            <p className="text-sm text-muted-foreground mt-1 ml-4">{property.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">${property.price}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                {selectedOrder.status === 'Report Ready' ? (
                  isLoadingReport ? (
                    <div className="py-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Loading report...</p>
                    </div>
                  ) : report ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Evaluation Report</h3>
                      
                      {/* Show evaluator if available */}
                      {selectedOrder.evaluator && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Evaluated by
                          </h4>
                          <EvaluatorProfile evaluator={selectedOrder.evaluator} variant="compact" />
                        </div>
                      )}
                      
                      <Tabs defaultValue="comments">
                        <TabsList className="mb-4">
                          <TabsTrigger value="comments">
                            <FileText className="h-4 w-4 mr-2" />
                            Comments
                          </TabsTrigger>
                          {report.imageUrl && (
                            <TabsTrigger value="images">
                              <FileImage className="h-4 w-4 mr-2" />
                              Images
                            </TabsTrigger>
                          )}
                          {report.videoUrl && (
                            <TabsTrigger value="video">
                              <FileVideo className="h-4 w-4 mr-2" />
                              Video
                            </TabsTrigger>
                          )}
                        </TabsList>
                        
                        <TabsContent value="comments" className="space-y-4">
                          <Card className="p-4">
                            <p className="whitespace-pre-line">
                              {report.comments}
                            </p>
                          </Card>
                        </TabsContent>
                        
                        {report.imageUrl && (
                          <TabsContent value="images">
                            <div className="border rounded-md overflow-hidden">
                              <img 
                                src={report.imageUrl}
                                alt="Property" 
                                className="w-full h-auto"
                              />
                              
                              <div className="p-3 bg-muted/30">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={report.imageUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Full Size
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                        )}
                        
                        {report.videoUrl && (
                          <TabsContent value="video">
                            <div className="border rounded-md overflow-hidden">
                              <div className="aspect-video bg-muted flex items-center justify-center">
                                <p className="text-muted-foreground">Video preview placeholder</p>
                              </div>
                              
                              <div className="p-3 bg-muted/30">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={report.videoUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Watch Video
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No report available</p>
                    </div>
                  )
                ) : (
                  <div className="py-8">
                    <div className="border border-dashed rounded-lg p-6 bg-muted/30">
                      <div className="text-center mb-6">
                        <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-1">Evaluation in progress</h3>
                        <p className="text-sm text-muted-foreground">
                          {getOrderStepMessage(selectedOrder)}
                        </p>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="mb-6 relative">
                        <div className="h-1 bg-muted-foreground/20 rounded-full mb-2">
                          <div 
                            className="h-1 bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(getCurrentStepNumber(selectedOrder) / 5) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Finding Evaluator</span>
                          <span>Evaluation</span>
                          <span>Report Ready</span>
                        </div>
                      </div>
                      
                      {/* Show evaluator if assigned */}
                      {selectedOrder.evaluator && selectedOrder.status !== 'Pending' && (
                        <div className="mb-6">
                          <h4 className="font-medium text-sm mb-2">Your Evaluator</h4>
                          <EvaluatorProfile evaluator={selectedOrder.evaluator} />
                        </div>
                      )}
                      
                      {/* Enhanced map for in-progress evaluations */}
                      {selectedOrder.currentStep && 
                       selectedOrder.currentStep !== 'PENDING_MATCH' && 
                       selectedOrder.currentStep !== 'REPORT_READY' && 
                       selectedOrder.currentPropertyIndex !== undefined && (
                        <div className="mb-6">
                          <p className="font-medium text-sm mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            Live Tracking
                          </p>
                          
                          <PropertyMap 
                            properties={selectedOrder.properties}
                            currentPropertyIndex={selectedOrder.currentPropertyIndex}
                            currentStep={getMapStepNumber(selectedOrder.currentStep)}
                            evaluator={selectedOrder.evaluator}
                            className="h-64"
                            showAllProperties={true}
                          />
                          
                          <div className="mt-4">
                            <h4 className="font-medium text-sm mb-2">Properties in this Order</h4>
                            <div className="space-y-2">
                              {selectedOrder.properties.map((property, index) => (
                                <div 
                                  key={property.id} 
                                  className={`border rounded p-2 flex justify-between items-center ${
                                    index === selectedOrder.currentPropertyIndex ? 'bg-primary/5 border-primary' : ''
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${
                                      index < (selectedOrder.currentPropertyIndex || 0) ? 'bg-green-500' : 
                                      index === (selectedOrder.currentPropertyIndex || 0) ? 'bg-primary animate-pulse' : 
                                      'bg-muted-foreground/30'
                                    }`}></div>
                                    <span className={`text-sm ${
                                      index === selectedOrder.currentPropertyIndex ? 'font-medium' : ''
                                    }`}>
                                      {property.address.split(',')[0]}
                                    </span>
                                  </div>
                                  <Badge variant={index === selectedOrder.currentPropertyIndex ? "default" : "outline"} className="text-xs">
                                    {index < (selectedOrder.currentPropertyIndex || 0) ? 'Completed' : 
                                     index === (selectedOrder.currentPropertyIndex || 0) ? 'Current' : 
                                     'Pending'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <Button onClick={() => navigate('/')}>
                          Request Another Evaluation
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
