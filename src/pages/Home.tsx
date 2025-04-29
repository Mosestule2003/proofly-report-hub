import React, { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Search, Building, ShieldCheck, Phone, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AgentContact } from '@/services/api';
import { useLoadScript, Libraries } from '@react-google-maps/api';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

// Define libraries correctly for TypeScript
const libraries: Libraries = ['places'];

const Home: React.FC = () => {
  const { addProperty } = useCart();
  const [propertyInput, setPropertyInput] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentCompany, setAgentCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentFields, setShowAgentFields] = useState(true); // Always shown by default
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null); // Changed to HTMLInputElement
  
  // Load Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBx6uFvT7K52tRTTHZ9OmSh8WPimMShU58", // This should be replaced with your actual API key
    libraries,
  });

  // Setup autocomplete when the script is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;
    
    // Initialize autocomplete
    autoCompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current, 
      { 
        types: ['address'],
        componentRestrictions: { country: 'us' } 
      }
    );
    
    // Add place_changed listener
    autoCompleteRef.current.addListener('place_changed', () => {
      const place = autoCompleteRef.current?.getPlace();
      if (place && place.formatted_address) {
        setPropertyInput(place.formatted_address);
        setFormattedAddress(place.formatted_address);
        validateField('property', place.formatted_address);
      }
    });
    
    return () => {
      // Clean up listener when component unmounts
      if (autoCompleteRef.current) {
        google.maps.event.clearInstanceListeners(autoCompleteRef.current);
      }
    };
  }, [isLoaded]);

  // Validate a specific field
  const validateField = (field: string, value: string): boolean => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'property':
        if (!value.trim()) {
          newErrors.property = "Property address is required";
        } else {
          delete newErrors.property;
        }
        break;
      case 'agentName':
        if (!value.trim()) {
          newErrors.agentName = "Agent/landlord name is required";
        } else {
          delete newErrors.agentName;
        }
        break;
      case 'agentEmail':
        if (!value.trim()) {
          newErrors.agentEmail = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.agentEmail = "Email is invalid";
        } else {
          delete newErrors.agentEmail;
        }
        break;
      case 'agentPhone':
        if (!value.trim()) {
          newErrors.agentPhone = "Phone number is required";
        } else {
          delete newErrors.agentPhone;
        }
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[field];
  };

  // Validate the entire form
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!propertyInput.trim()) {
      newErrors.property = "Property address is required";
    }
    
    if (showAgentFields) {
      if (!agentName.trim()) {
        newErrors.agentName = "Agent/landlord name is required";
      }
      
      if (!agentEmail.trim()) {
        newErrors.agentEmail = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(agentEmail)) {
        newErrors.agentEmail = "Email is invalid";
      }
      
      if (!agentPhone.trim()) {
        newErrors.agentPhone = "Phone number is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Collect landlord info since it's required now
    const landlordInfo = {
      name: agentName,
      email: agentEmail,
      phone: agentPhone,
      company: agentCompany || undefined
    };
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      addProperty({
        id: crypto.randomUUID(),
        address: propertyInput,
        description: '',
        price: 30, // Default price
        landlordInfo // Always include landlord info
      });
      
      // Show success notification
      toast.success("Property added to cart", {
        description: "You can view your cart to see the property details."
      });
      
      // Reset form
      setPropertyInput('');
      setFormattedAddress('');
      setAgentName('');
      setAgentEmail('');
      setAgentPhone('');
      setAgentCompany('');
      
    } catch (error) {
      toast.error("Failed to add property", {
        description: "Please try again"
      });
      console.error("Error adding property:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle errors with Maps API loading
  if (loadError) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Error loading maps</h2>
          <p className="mb-4">We couldn't load the Google Maps API. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Property Evaluation Made Easy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Get expert property evaluations with detailed reports in just a few simple steps.
          </p>
          
          <form onSubmit={handleAddToCart} className="w-full max-w-2xl mx-auto">
            <div className="bg-card border rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="property" className="text-base font-medium">
                    Property Address
                  </Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute top-3 left-3 text-muted-foreground h-5 w-5" />
                    {!isLoaded ? (
                      <div className="w-full p-3 pl-10 border rounded-lg h-24 bg-muted/20 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2">Loading address search...</span>
                      </div>
                    ) : (
                      <Input
                        id="property"
                        ref={inputRef}
                        className={`w-full p-3 pl-10 ${
                          errors.property ? 'border-red-500 focus:ring-red-200' : 'focus:ring-primary focus:border-primary'
                        }`}
                        placeholder="Start typing an address..."
                        value={propertyInput}
                        onChange={(e) => {
                          setPropertyInput(e.target.value);
                          validateField('property', e.target.value);
                        }}
                      />
                    )}
                  </div>
                  {errors.property && <p className="text-sm text-red-500 mt-1">{errors.property}</p>}
                  {formattedAddress && (
                    <div className="mt-2 p-2 bg-primary/5 border rounded text-sm">
                      <p className="font-medium">Selected address:</p>
                      <p>{formattedAddress}</p>
                    </div>
                  )}
                </div>
                
                {/* Landlord information fields - now always visible */}
                <div className="space-y-4 mt-2 p-4 bg-muted/30 rounded-lg border">
                  <h3 className="font-medium">Landlord Information (Required)</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="agentName">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="agentName"
                        placeholder="Full name"
                        value={agentName}
                        onChange={(e) => {
                          setAgentName(e.target.value);
                          validateField('agentName', e.target.value);
                        }}
                        className={errors.agentName ? 'border-red-500' : ''}
                      />
                      {errors.agentName && <p className="text-sm text-red-500 mt-1">{errors.agentName}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="agentEmail">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="agentEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={agentEmail}
                        onChange={(e) => {
                          setAgentEmail(e.target.value);
                          validateField('agentEmail', e.target.value);
                        }}
                        className={errors.agentEmail ? 'border-red-500' : ''}
                      />
                      {errors.agentEmail && <p className="text-sm text-red-500 mt-1">{errors.agentEmail}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="agentPhone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="agentPhone"
                        placeholder="555-123-4567"
                        value={agentPhone}
                        onChange={(e) => {
                          setAgentPhone(e.target.value);
                          validateField('agentPhone', e.target.value);
                        }}
                        className={errors.agentPhone ? 'border-red-500' : ''}
                      />
                      {errors.agentPhone && <p className="text-sm text-red-500 mt-1">{errors.agentPhone}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="agentCompany">
                        Company (Optional)
                      </Label>
                      <Input
                        id="agentCompany"
                        placeholder="Company name"
                        value={agentCompany}
                        onChange={(e) => setAgentCompany(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="mt-6 w-full"
                disabled={
                  isLoading || 
                  !propertyInput.trim() || 
                  !agentName.trim() || 
                  !agentEmail.trim() || 
                  !agentPhone.trim()
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Add to Cart"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </section>
      
      <section className="bg-secondary py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Properties</h3>
              <p className="text-muted-foreground">
                Enter the properties you want to have evaluated. You can add as many as you need.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Review</h3>
              <p className="text-muted-foreground">
                Our professional evaluators will assess each property thoroughly.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Reports</h3>
              <p className="text-muted-foreground">
                Receive detailed reports with insights and recommendations for each property.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Future Proofly Features</h2>
          <p className="text-center text-muted-foreground mb-10">
            We're constantly improving our platform to serve you better
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Landlord Dashboards</h3>
              <p className="text-muted-foreground">
                Manage multiple properties and tenant evaluations from a single dashboard.
              </p>
            </div>
            
            <div className="border p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Escrow Deposit System</h3>
              <p className="text-muted-foreground">
                Securely handle move-in funds with our upcoming escrow payment system.
              </p>
            </div>
            
            <div className="border p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Full Onboarding</h3>
              <p className="text-muted-foreground">
                Complete property listing, lease signing, and verification workflows.
              </p>
            </div>
            
            <div className="border p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Automated Reporting</h3>
              <p className="text-muted-foreground">
                AI-assisted property assessment and reporting for faster turnaround.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
