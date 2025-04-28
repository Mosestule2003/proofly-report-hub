
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, Trash2, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { toast } from 'sonner';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { properties, removeProperty, getTotalPrice, getDiscount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.warning("Please log in to complete checkout", {
        description: "You'll be redirected to the login page.",
        action: {
          label: "Login",
          onClick: () => navigate('/login')
        }
      });
      return;
    }
    
    if (!user) {
      toast.error("User session error");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Calculate totals
      const totalPrice = getTotalPrice();
      const discount = getDiscount();
      
      // Create order
      const order = await api.createOrder(
        user.id,
        properties,
        totalPrice,
        discount
      );
      
      toast.success("Order created successfully!", {
        description: `Order #${order.id.substring(0, 8)} is being processed.`
      });
      
      // Clear cart and navigate to success page
      clearCart();
      navigate(`/checkout/success/${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to process checkout", {
        description: "Please try again later."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (properties.length === 0) {
    return (
      <div className="container max-w-4xl py-12">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <Building className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some properties to get started with your evaluation.
            </p>
            <Button onClick={() => navigate('/')}>
              Add Properties
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Properties ({properties.length})</h2>
              
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h3 className="font-medium">{property.address}</h3>
                      {property.description && (
                        <p className="text-sm text-muted-foreground">{property.description}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="font-semibold">${property.price.toFixed(2)}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive h-8 px-2" 
                        onClick={() => removeProperty(property.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {!isAuthenticated && (
            <Card className="bg-muted/50 border-muted">
              <div className="p-4 flex items-start space-x-4">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Please log in to continue</h3>
                  <p className="text-sm text-muted-foreground">
                    You need to be logged in to complete your order.
                  </p>
                  <div className="mt-2 space-x-2">
                    <Button size="sm" variant="outline" onClick={() => navigate('/login')}>Log in</Button>
                    <Button size="sm" onClick={() => navigate('/signup')}>Sign up</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(getTotalPrice() + getDiscount()).toFixed(2)}</span>
                </div>
                
                {getDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (15%)</span>
                    <span>-${getDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                
                {properties.length > 5 ? (
                  <p className="text-xs text-green-600 mt-1">
                    15% discount applied for 5+ properties!
                  </p>
                ) : properties.length > 3 ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Add {6 - properties.length} more for a 15% discount!
                  </p>
                ) : null}
              </div>
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                disabled={isProcessing}
                onClick={handleCheckout}
              >
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
