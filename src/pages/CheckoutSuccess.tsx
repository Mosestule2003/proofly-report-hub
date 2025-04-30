
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, MessageCircle, Loader2, Building } from 'lucide-react';
import { api, Order } from '@/services/api';
import OrderProcessingModal from '@/components/OrderProcessingModal';
import { Property } from '@/context/CartContext';
import { Progress } from '@/components/ui/progress';

// New component for AI outreach simulation
const AIOutreachSimulation = ({ properties, onComplete }: { properties: Property[], onComplete: () => void }) => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [outreachStep, setOutreachStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const steps = ['Dialing Landlord...', 'Verifying Availability...', 'Scheduling Viewing...', 'Viewing Scheduled!'];
  const totalSteps = properties.length * steps.length;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (outreachStep < steps.length - 1) {
        setOutreachStep(prev => prev + 1);
      } else if (currentPropertyIndex < properties.length - 1) {
        setCurrentPropertyIndex(prev => prev + 1);
        setOutreachStep(0);
      } else {
        setTimeout(onComplete, 1000); // Wait 1 second before completing
      }
      
      // Calculate progress
      const completedSteps = (currentPropertyIndex * steps.length) + outreachStep + 1;
      setProgress((completedSteps / totalSteps) * 100);
      
    }, 1500); // Each step takes 1.5 seconds
    
    return () => clearTimeout(timer);
  }, [currentPropertyIndex, outreachStep, properties.length, totalSteps, onComplete]);
  
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card shadow-lg rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="text-center mb-6">
          <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">AI Landlord Outreach</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Our AI assistant is contacting landlords and scheduling viewings
          </p>
        </div>
        
        <div className="space-y-6 my-8">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{properties[currentPropertyIndex].address.split(',')[0]}</p>
                <p className="text-xs text-muted-foreground">Property {currentPropertyIndex + 1} of {properties.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p>{steps[outreachStep]}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Contacting Landlords</span>
              <span>Scheduling Viewings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showAIOutreach, setShowAIOutreach] = useState(true);
  
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      
      try {
        const orderData = await api.getOrderById(orderId);
        if (orderData) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrder();
  }, [orderId]);
  
  const handleAIOutreachComplete = () => {
    setShowAIOutreach(false);
    setShowProcessing(true);
  };
  
  const handleProcessingComplete = () => {
    setShowProcessing(false);
    
    // Update order status to "Report Ready" (simulated)
    if (order) {
      api.updateOrderStatus(order.id, 'Report Ready')
        .then(() => {
          // In a real app, the WebSocket would push this update
          console.log('Order status updated to Report Ready');
        })
        .catch(err => {
          console.error('Error updating order status:', err);
        });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12 text-center">
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-lg text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Order Not Found</CardTitle>
            <CardDescription>
              We couldn't find the order details. Please check the URL or contact support.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Ensure all properties have an id and price (required for OrderProcessingModal)
  const propertiesWithIds = order?.properties.map(prop => ({
    id: prop.id || crypto.randomUUID(),
    address: prop.address,
    description: prop.description || '',
    price: prop.price || 30
  })) as Property[] || [];
  
  return (
    <>
      {showAIOutreach && (
        <AIOutreachSimulation 
          properties={propertiesWithIds} 
          onComplete={handleAIOutreachComplete}
        />
      )}
      
      {showProcessing && (
        <OrderProcessingModal 
          properties={propertiesWithIds} 
          onComplete={handleProcessingComplete} 
        />
      )}
      
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Your property evaluation request has been submitted.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{order.id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Properties</p>
                  <p className="font-medium">{order.properties.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {showAIOutreach ? 'Contacting Landlords' : 
                     showProcessing ? 'Processing' : 'Report Ready'}
                  </p>
                </div>
              </div>
            </div>
            
            {!showProcessing && !showAIOutreach && (
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="font-medium mb-2">Good news! Your report is ready.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  View the details in your dashboard.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  View Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Home
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default CheckoutSuccess;
