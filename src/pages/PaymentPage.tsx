
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useCart } from '@/context/CartContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Calendar, Lock, Info, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cityPricing, proximityZoneDescriptions } from '@/utils/pricingUtils';

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(19),
  nameOnCard: z.string().min(2, "Name is required"),
  expiryDate: z.string().min(5, "Expiry date is required").max(5),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4)
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    properties, 
    getTotalPrice, 
    getDiscount,
    getBaseFeesTotal,
    getProximityFeesTotal,
    getRushFeesTotal,
    getSurgeFee,
    isRushBooking,
    isSurgeActive 
  } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPricingExplanation, setShowPricingExplanation] = useState(false);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      nameOnCard: '',
      expiryDate: '',
      cvv: ''
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment successful!", {
        description: "Your payment has been processed."
      });
      navigate(`/checkout/processing`);
    }, 2000);
  };

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Payment Details</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Enter your payment information</CardTitle>
              <CardDescription>
                Your payment details are securely processed
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              placeholder="1234 5678 9012 3456" 
                              {...field} 
                              className="pl-10"
                              onChange={(e) => {
                                // Format card number with spaces
                                const value = e.target.value.replace(/\s/g, '');
                                const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nameOnCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name on Card</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                placeholder="MM/YY" 
                                {...field} 
                                className="pl-10"
                                maxLength={5}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/[^\d]/g, '');
                                  if (value.length > 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                  }
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="123" 
                                {...field} 
                                className="pl-10"
                                maxLength={4}
                              />
                            </FormControl>
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay $${getTotalPrice().toFixed(2)} CAD`
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Order Summary</CardTitle>
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
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
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
              
              {/* Subtotal */}
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
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)} CAD</span>
              </div>
              
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <p className="mb-2">Properties in cart: {properties.length}</p>
                {properties.map((property, index) => (
                  <div key={property.id} className="mb-2">
                    <div className="truncate font-medium mb-0.5">{index + 1}. {property.address}</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex items-center">
                        <span>
                          {property.city && cityPricing[property.city] 
                            ? cityPricing[property.city].name 
                            : 'Vancouver'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>Zone {property.proximityZone || 'A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Pricing Explanation Dialog */}
      <Dialog open={showPricingExplanation} onOpenChange={setShowPricingExplanation}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>How Pricing Works</DialogTitle>
            <DialogDescription>
              We calculate property evaluation costs based on several factors
            </DialogDescription>
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
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
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
                  <span className="font-medium">Zone D (>15 km):</span> +$9
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
    </div>
  );
};

export default PaymentPage;
