
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, Trash2, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { useCart, LandlordInfo } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { properties, removeProperty, getTotalPrice, getDiscount, clearCart, updatePropertyLandlord } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [landlordInfo, setLandlordInfo] = useState<LandlordInfo>({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  
  // Check if all properties have landlord info
  const allPropertiesHaveLandlordInfo = properties.length > 0 && 
    properties.every(property => property.landlordInfo?.name && property.landlordInfo?.email && property.landlordInfo?.phone);
  
  // Reset landlord info when editing property changes
  useEffect(() => {
    if (editingPropertyId) {
      const property = properties.find(p => p.id === editingPropertyId);
      if (property?.landlordInfo) {
        setLandlordInfo(property.landlordInfo);
      } else {
        setLandlordInfo({ name: '', email: '', phone: '', company: '' });
      }
    }
  }, [editingPropertyId, properties]);
  
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
    
    if (!allPropertiesHaveLandlordInfo) {
      toast.error("Please provide landlord information for all properties");
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
  
  const handleEditLandlord = (propertyId: string) => {
    setEditingPropertyId(propertyId);
  };
  
  const handleSaveLandlord = () => {
    if (!editingPropertyId) return;
    
    // Validate required fields
    if (!landlordInfo.name || !landlordInfo.email || !landlordInfo.phone) {
      toast.error("Please fill all required landlord fields");
      return;
    }
    
    updatePropertyLandlord(editingPropertyId, landlordInfo);
    setEditingPropertyId(null);
    
    toast.success("Landlord information saved");
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
                  <div key={property.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
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
                    
                    {/* Landlord Information Section */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Landlord Information</h4>
                        {property.landlordInfo ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditLandlord(property.id)}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">Required</span>
                        )}
                      </div>
                      
                      {property.landlordInfo ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span> {property.landlordInfo.name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span> {property.landlordInfo.email}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span> {property.landlordInfo.phone}
                          </div>
                          {property.landlordInfo.company && (
                            <div>
                              <span className="text-muted-foreground">Company:</span> {property.landlordInfo.company}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditLandlord(property.id)}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Add Landlord Information
                          </Button>
                        </div>
                      )}
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
              
              {!allPropertiesHaveLandlordInfo && (
                <div className="mt-4 mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p>Please provide landlord information for all properties.</p>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                disabled={isProcessing || !allPropertiesHaveLandlordInfo || !isAuthenticated}
                onClick={handleCheckout}
              >
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </Button>
              
              {!isAuthenticated && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Please log in to continue with checkout
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Landlord Edit Dialog */}
      <Dialog open={!!editingPropertyId} onOpenChange={(open) => !open && setEditingPropertyId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Landlord Information</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={landlordInfo.name}
                onChange={(e) => setLandlordInfo({ ...landlordInfo, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={landlordInfo.email}
                onChange={(e) => setLandlordInfo({ ...landlordInfo, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={landlordInfo.phone}
                onChange={(e) => setLandlordInfo({ ...landlordInfo, phone: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                value={landlordInfo.company || ''}
                onChange={(e) => setLandlordInfo({ ...landlordInfo, company: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPropertyId(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveLandlord}>
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
