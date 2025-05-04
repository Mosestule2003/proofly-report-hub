import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, Trash2, AlertCircle, Edit2, Check, X, Info, MapPin } from 'lucide-react';
import { useCart, LandlordInfo } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cityPricing, proximityZoneDescriptions } from '@/utils/pricingUtils';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    properties,
    removeProperty,
    getTotalPrice,
    getDiscount,
    clearCart,
    updatePropertyLandlord,
    getBaseFeesTotal,
    getProximityFeesTotal,
    getRushFeesTotal,
    getSurgeFee,
    toggleRushBooking,
    isRushBooking,
    isSurgeActive
  } = useCart();
  
  const {
    user,
    isAuthenticated
  } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [landlordInfo, setLandlordInfo] = useState<LandlordInfo>({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [showPricingExplanation, setShowPricingExplanation] = useState(false);
  
  // Check if all properties have landlord info
  const allPropertiesHaveLandlordInfo = properties.length > 0 && properties.every(property => 
    property.landlordInfo?.name && property.landlordInfo?.phone);

  // Reset landlord info when editing property changes
  useEffect(() => {
    if (editingPropertyId) {
      const property = properties.find(p => p.id === editingPropertyId);
      if (property?.landlordInfo) {
        setLandlordInfo(property.landlordInfo);
      } else {
        setLandlordInfo({
          name: '',
          email: '',
          phone: '',
          company: ''
        });
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
    
    // Navigate to payment page instead of direct checkout
    navigate('/payment');
  };

  const handleEditLandlord = (propertyId: string) => {
    setEditingPropertyId(propertyId);
  };
  
  const handleSaveLandlord = () => {
    if (!editingPropertyId) return;

    // Validate required fields
    if (!landlordInfo.name || !landlordInfo.phone) {
      toast.error("Please fill all required landlord fields");
      return;
    }
    updatePropertyLandlord(editingPropertyId, landlordInfo);
    setEditingPropertyId(null);
    toast.success("Landlord information saved");
  };

  if (properties.length === 0) {
    return <div className="container max-w-4xl py-12">
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
      </div>;
  }
  
  // Calculate if eligible for bulk discount
  const isBulkDiscountEligible = properties.length >= 4;
  
  return <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Properties ({properties.length})</h2>
              
              <div className="space-y-4">
                {properties.map((property, index) => (
                  <div key={property.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{property.address}</h3>
                        {property.description && <p className="text-sm text-muted-foreground">{property.description}</p>}
                        
                        {/* Display city and zone information */}
                        <div className="flex items-center mt-2 space-x-2 text-xs">
                          <span className="px-2 py-1 bg-muted rounded-full">
                            {property.city && cityPricing[property.city] 
                              ? cityPricing[property.city].name 
                              : 'Vancouver'}
                          </span>
                          <span className="px-2 py-1 bg-muted rounded-full flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            Zone {property.proximityZone || 'A'}: 
                            {property.proximityZone && proximityZoneDescriptions[property.proximityZone]}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">${property.price.toFixed(2)}</span>
                        <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => removeProperty(property.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    
                    {/* Pricing breakdown per property */}
                    <div className="mt-2 p-2 bg-muted/20 rounded-md text-sm">
                      <div className="grid grid-cols-3 gap-1">
                        <div>
                          <span className="text-muted-foreground">Base fee:</span> ${property.pricing?.basePrice.toFixed(2)}
                        </div>
                        
                        {(property.pricing?.proximityFee || 0) > 0 && (
                          <div>
                            <span className="text-muted-foreground">Distance:</span> +${property.pricing?.proximityFee.toFixed(2)}
                          </div>
                        )}
                        
                        {isRushBooking() && (
                          <div>
                            <span className="text-muted-foreground">Rush:</span> +${property.pricing?.rushFee.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Landlord Information Section */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Landlord Information</h4>
                        {property.landlordInfo ? (
                          <Button variant="ghost" size="sm" onClick={() => handleEditLandlord(property.id)}>
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
                            <span className="text-muted-foreground">Email:</span> {property.landlordInfo.email || 'N/A'}
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
                          <Button variant="outline" size="sm" onClick={() => handleEditLandlord(property.id)}>
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Add Landlord Information
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Rush Booking Option */}
              <div className="mt-6 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Rush Booking (24hr)</h3>
                    <p className="text-sm text-muted-foreground">
                      Request property viewing within 24 hours (+$7 per property)
                    </p>
                  </div>
                  <Switch 
                    checked={isRushBooking()}
                    onCheckedChange={toggleRushBooking}
                  />
                </div>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPricingExplanation(true)}
                  className="text-xs flex items-center h-7"
                >
                  <Info className="h-3.5 w-3.5 mr-1" />
                  How pricing works
                </Button>
              </div>
              
              <div className="space-y-2 text-sm">
                {/* Base fees */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base fees</span>
                  <span>${getBaseFeesTotal().toFixed(2)}</span>
                </div>
                
                {/* Distance/proximity fees */}
                {getProximityFeesTotal() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance fees</span>
                    <span>+${getProximityFeesTotal().toFixed(2)}</span>
                  </div>
                )}
                
                {/* Rush fees */}
                {isRushBooking() && getRushFeesTotal() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rush booking</span>
                    <span>+${getRushFeesTotal().toFixed(2)}</span>
                  </div>
                )}
                
                {/* Surge fee */}
                {isSurgeActive() && getSurgeFee() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Surge fee</span>
                    <span>+${getSurgeFee().toFixed(2)}</span>
                  </div>
                )}
                
                {/* Subtotal before discount */}
                <div className="flex justify-between font-medium pt-2">
                  <span>Subtotal</span>
                  <span>${(getTotalPrice() + getDiscount()).toFixed(2)}</span>
                </div>
                
                {/* Bulk discount */}
                {getDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bulk discount (10%)</span>
                    <span>-${getDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                {/* Final total */}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)} CAD</span>
                </div>
                
                {isBulkDiscountEligible ? (
                  <p className="text-xs text-green-600 mt-1">
                    10% bulk discount applied!
                  </p>
                ) : properties.length > 1 ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Add {4 - properties.length} more for a 10% discount!
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
                size="lg" 
                disabled={isProcessing || !allPropertiesHaveLandlordInfo || !isAuthenticated} 
                onClick={handleCheckout} 
                className="w-full mt-6"
              >
                {isProcessing ? "Processing..." : "Proceed to Payment"}
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
      <Dialog open={!!editingPropertyId} onOpenChange={open => !open && setEditingPropertyId(null)}>
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
                onChange={e => setLandlordInfo({
                  ...landlordInfo,
                  name: e.target.value
                })} 
                className="col-span-3" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email (Optional)
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={landlordInfo.email || ''} 
                onChange={e => setLandlordInfo({
                  ...landlordInfo,
                  email: e.target.value
                })} 
                className="col-span-3"
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
                onChange={e => setLandlordInfo({
                  ...landlordInfo,
                  phone: e.target.value
                })} 
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
                onChange={e => setLandlordInfo({
                  ...landlordInfo,
                  company: e.target.value
                })} 
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
      
      {/* Pricing Explanation Dialog */}
      <Dialog open={showPricingExplanation} onOpenChange={setShowPricingExplanation}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>How Pricing Works</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h3 className="font-medium">City-Based Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Each city has a different base price reflecting local costs:
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                <div className="p-2 border rounded-md">
                  <span className="font-medium">Kamloops:</span> $18
                </div>
                <div className="p-2 border rounded-md">
                  <span className="font-medium">Vancouver:</span> $28
                </div>
                <div className="p-2 border rounded-md">
                  <span className="font-medium">Toronto:</span> $30
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Distance Zones</h3>
              <p className="text-sm text-muted-foreground">
                Additional fees based on property distance:
              </p>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <div className="p-2 border rounded-md">
                  <span className="font-medium">Zone A (0-5 km):</span> +$0
                </div>
                <div className="p-2 border rounded-md">
                  <span className="font-medium">Zone B (5-10 km):</span> +$3
                </div>
                <div className="p-2 border rounded-md">
                  <span className="font-medium">Zone C (10-15 km):</span> +$6
                </div>
                <div className="p-2 border rounded-md">
                  <span className="font-medium">Zone D (&gt;15 km):</span> +$9
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Rush Booking Option</h3>
              <p className="text-sm text-muted-foreground">
                For viewing properties within 24 hours:
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm mt-2">
                <div className="p-2 border rounded-md">
                  <span className="font-medium">Rush fee:</span> +$7 per property
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Bulk Discount</h3>
              <p className="text-sm text-muted-foreground">
                For 4 or more properties, we apply a 10% discount to your total evaluation fee.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Surge Pricing</h3>
              <p className="text-sm text-muted-foreground">
                During high demand periods, a $5 surge fee may be added per session.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowPricingExplanation(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};

export default Cart;
