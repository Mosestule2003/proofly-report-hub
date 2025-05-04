
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export const PropertyForm: React.FC = () => {
  const navigate = useNavigate();
  const { addProperty } = useCart();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    address: '',
    description: '',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: '',
    landlordCompany: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.address || !formData.landlordName || !formData.landlordEmail || !formData.landlordPhone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    // Start loading process
    setIsLoading(true);
    
    // Simulate API call/processing
    setTimeout(() => {
      const newProperty = {
        id: crypto.randomUUID(),
        address: formData.address,
        description: formData.description,
        price: 30, // Base price
        landlordInfo: {
          name: formData.landlordName,
          email: formData.landlordEmail,
          phone: formData.landlordPhone,
          company: formData.landlordCompany || 'N/A'
        }
      };
      
      addProperty(newProperty);
      setIsLoading(false);
      setSubmitted(true);
      
      toast({
        title: 'Property Added',
        description: 'The property has been added to your cart.',
      });
      
      setTimeout(() => {
        navigate('/cart');
      }, 2000);
    }, 1500);
  };
  
  return (
    <Card className="border border-gray-100 shadow-lg">
      <CardContent className="p-6">
        {submitted ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Property Added Successfully</h3>
            <p className="text-gray-600">Your property has been added to your cart.</p>
            <Button 
              onClick={() => navigate('/cart')}
              className="bg-[#FF385C] hover:bg-[#e0334f] text-white mt-4"
            >
              View Cart
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-base">
                  Property Address <span className="text-[#FF385C]">*</span>
                </Label>
                <div className="mt-1.5 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter the complete property address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10 bg-white border-gray-300"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-base">Property Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add any additional details about the property"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1.5 bg-white border-gray-300"
                  rows={3}
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Landlord Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="landlordName" className="text-base">
                      Name <span className="text-[#FF385C]">*</span>
                    </Label>
                    <Input
                      id="landlordName"
                      name="landlordName"
                      placeholder="Landlord's full name"
                      value={formData.landlordName}
                      onChange={handleChange}
                      className="mt-1.5 bg-white border-gray-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="landlordEmail" className="text-base">
                      Email <span className="text-[#FF385C]">*</span>
                    </Label>
                    <Input
                      id="landlordEmail"
                      name="landlordEmail"
                      type="email"
                      placeholder="Landlord's email address"
                      value={formData.landlordEmail}
                      onChange={handleChange}
                      className="mt-1.5 bg-white border-gray-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="landlordPhone" className="text-base">
                      Phone <span className="text-[#FF385C]">*</span>
                    </Label>
                    <Input
                      id="landlordPhone"
                      name="landlordPhone"
                      placeholder="Landlord's phone number"
                      value={formData.landlordPhone}
                      onChange={handleChange}
                      className="mt-1.5 bg-white border-gray-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="landlordCompany" className="text-base">Company (Optional)</Label>
                    <Input
                      id="landlordCompany"
                      name="landlordCompany"
                      placeholder="Landlord's company name"
                      value={formData.landlordCompany}
                      onChange={handleChange}
                      className="mt-1.5 bg-white border-gray-300"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Base Price</h3>
                    <p className="text-sm text-gray-600">Standard property evaluation</p>
                  </div>
                  <div className="text-xl font-bold">$30</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-[#FF385C] hover:bg-[#e0334f] text-white px-8 py-2.5 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
