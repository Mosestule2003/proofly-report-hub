import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Calendar, CreditCard, Clock, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { OrderProcessingModalWrapper } from '@/components/OrderProcessingModalWrapper';
import { ProoflyWorkflowStages } from '@/components/ProoflyWorkflowStages';

// Define the order interface
interface Property {
  id: string;
  address: string;
  zipCode: string;
  city: string;
  price: number;
  distanceTier?: string;
}

interface Order {
  id: string;
  properties: Property[];
  totalPrice: number;
  discount?: number;
  surge?: boolean;
}

const SuccessItem: React.FC<{ icon: LucideIcon; title: string; description: string }> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="flex items-start space-x-4">
    <div className="bg-green-50 p-2 rounded-full">
      <Icon className="h-5 w-5 text-green-500" />
    </div>
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const CheckoutSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);

  // This simulates fetching the order details
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock order data based on URL params
      const totalPrice = parseFloat(searchParams.get('total') || '0');
      const mockOrder: Order = {
        id: orderId || 'unknown',
        properties: [
          {
            id: '1',
            address: '123 Main St',
            zipCode: 'V2C 1T1',
            city: 'Kamloops',
            price: totalPrice * 0.6,
            distanceTier: 'Zone A'
          },
          {
            id: '2',
            address: '456 Elm St',
            zipCode: 'V2C 2G8',
            city: 'Kamloops',
            price: totalPrice * 0.4,
            distanceTier: 'Zone B'
          }
        ],
        totalPrice,
        discount: totalPrice > 50 ? 10 : undefined,
        surge: Math.random() > 0.5
      };
      setOrder(mockOrder);
      setIsLoading(false);
      
      // Show workflow after a short delay
      const workflowTimer = setTimeout(() => {
        setShowWorkflow(true);
      }, 2000);
      
      return () => clearTimeout(workflowTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, [orderId, searchParams]);

  const handleComplete = async () => {
    navigate('/dashboard');
  };

  const rushBooking = searchParams.get('rush') === 'true';

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <OrderProcessingModalWrapper
          properties={[]}
          onComplete={handleComplete}
          totalPrice={0}
          rush={rushBooking}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Your order #{orderId} has been successfully placed.
        </p>
      </div>

      {/* Workflow Stages */}
      {showWorkflow && (
        <div className="mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 text-center">Your Proofly Journey</h2>
          <ProoflyWorkflowStages />
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
          <CardDescription>Review your property evaluation details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <SuccessItem 
              icon={Calendar}
              title="Evaluation Schedule"
              description={rushBooking ? "Within 24 hours (Rush)" : "Within 3-5 business days"}
            />
            <SuccessItem 
              icon={CreditCard}
              title="Payment"
              description={`$${order.totalPrice.toFixed(2)} CAD`}
            />
            <SuccessItem 
              icon={Clock}
              title="Order Placed"
              description={new Date().toLocaleString()}
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Properties to be Evaluated:</h3>
            <div className="space-y-3">
              {order.properties.map((property) => (
                <div key={property.id} className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium">{property.address}</h4>
                  <p className="text-sm text-gray-600">{property.city}, {property.zipCode}</p>
                  <div className="flex justify-between mt-1 text-sm">
                    <span>{property.distanceTier}</span>
                    <span>${property.price.toFixed(2)} CAD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>${order.totalPrice.toFixed(2)} CAD</span>
            </div>
            {order.discount && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Bulk Discount</span>
                <span>-${((order.totalPrice * order.discount) / 100).toFixed(2)} CAD</span>
              </div>
            )}
            {rushBooking && (
              <div className="flex justify-between mb-2">
                <span>Rush Fee</span>
                <span>$7.00 CAD</span>
              </div>
            )}
            {order.surge && (
              <div className="flex justify-between mb-2">
                <span>Surge Fee</span>
                <span>$5.00 CAD</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)} CAD</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          variant="default"
          size="lg"
          onClick={() => navigate('/dashboard')}
          className="bg-[#FF385C] hover:bg-[#e0334f]"
        >
          View Dashboard
        </Button>
        <Button 
          variant="outline"
          size="lg"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
