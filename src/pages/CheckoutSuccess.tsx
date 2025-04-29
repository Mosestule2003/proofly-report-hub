
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { api, Order } from '@/services/api';
import OrderProcessingModal from '@/components/OrderProcessingModal';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProcessing, setShowProcessing] = useState(true);
  
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
  
  // Ensure all properties have an id (required for OrderProcessingModal)
  const propertiesWithIds = order.properties.map(prop => ({
    id: prop.id || crypto.randomUUID(),
    address: prop.address
  }));
  
  return (
    <>
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
                  <p className="font-medium">{showProcessing ? 'Processing' : 'Report Ready'}</p>
                </div>
              </div>
            </div>
            
            {!showProcessing && (
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
