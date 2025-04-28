
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { api, Order } from '@/services/api';

const CheckoutSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        navigate('/');
        return;
      }
      
      try {
        const orderData = await api.getOrderById(orderId);
        
        if (!orderData) {
          navigate('/');
          return;
        }
        
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
    
    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [orderId, navigate]);
  
  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Loading order details...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl py-12">
      <Card className="p-8">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
          <p className="text-xl text-muted-foreground">
            Your evaluation request has been received
          </p>
        </div>
        
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-3">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-medium">{orderId?.substring(0, 8)}</span>
          </div>
          
          <div className="flex justify-between mb-3">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">
              {order ? new Date(order.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
          
          <div className="flex justify-between mb-3">
            <span className="text-muted-foreground">Properties:</span>
            <span className="font-medium">{order?.properties.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold">${order?.totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Our evaluation team will review your request and begin processing your property evaluations.
            You'll receive updates on your dashboard as we make progress.
          </p>
          <p className="text-sm text-muted-foreground">
            You will be redirected to your dashboard in a few seconds.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            Return Home
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;
