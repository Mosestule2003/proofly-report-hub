
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
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, Order, Report } from '@/services/api';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  
  // Protect route
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isLoading]);
  
  // Load user orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      
      try {
        // Initialize sample data
        api.initMockData(user);
        
        // Load orders for user
        const userOrders = await api.getOrders(user.id);
        setOrders(userOrders);
        
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
        console.error('Error loading orders', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, [user]);
  
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
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
        
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
  
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
      
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
                
                <h3 className="text-lg font-semibold mb-3">Properties</h3>
                <div className="space-y-2 mb-6">
                  {selectedOrder.properties.map((property) => (
                    <div key={property.id} className="border rounded-md p-3">
                      <p className="font-medium">{property.address}</p>
                      {property.description && (
                        <p className="text-sm text-muted-foreground">{property.description}</p>
                      )}
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
                    <div className="border border-dashed rounded-lg p-6 bg-muted/30 text-center">
                      <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-1">Evaluation in progress</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your property evaluation is currently in {selectedOrder.status.toLowerCase()} status.
                        We'll notify you when the report is ready.
                      </p>
                      <Button onClick={() => navigate('/')}>
                        Request Another Evaluation
                      </Button>
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
