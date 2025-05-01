import React, { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Search, Building, ShieldCheck, Phone, MapPin, Loader2, CloudRain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AgentContact } from '@/services/api';
import { useLoadScript, Libraries } from '@react-google-maps/api';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import ProoflyRoadmap from '@/components/ProoflyRoadmap';

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
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [weatherMultiplier, setWeatherMultiplier] = useState<number>(1.0);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);
  
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
    
    try {
      // Initialize autocomplete
      autoCompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current, 
        { 
          types: ['address'],
          componentRestrictions: { country: 'us' } 
        }
      );
      
      // Add place_changed listener
      const listener = autoCompleteRef.current.addListener('place_changed', () => {
        const place = autoCompleteRef.current?.getPlace();
        
        if (place && place.formatted_address) {
          setPropertyInput(place.formatted_address);
          setFormattedAddress(place.formatted_address);
          validateField('property', place.formatted_address);
          
          // Store latitude and longitude if available
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setCoordinates({ lat, lng });
            setIsValidAddress(true);
            
            // Simulate fetching weather data
            simulateWeatherCheck(lat, lng);
          } else {
            setCoordinates(null);
            setIsValidAddress(false);
          }
        }
      });
      
      return () => {
        // Clean up listener when component unmounts
        if (autoCompleteRef.current) {
          google.maps.event.clearListeners(autoCompleteRef.current, 'place_changed');
        }
      };
    } catch (error) {
      console.error("Error initializing Google Maps autocomplete:", error);
      setGoogleMapsError(true);
      // If there's an error, we won't disable the input field
    }
  }, [isLoaded]);

  // Handle API errors
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps API failed to load:", loadError);
      setGoogleMapsError(true);
    }
  }, [loadError]);

  // Simulate weather check
  const simulateWeatherCheck = (lat: number, lng: number) => {
    // In a real implementation, this would call a weather API
    // For demo purposes, randomly assign a weather condition
    const randomCondition = Math.random();
    
    if (randomCondition > 0.9) {
      // Extreme weather - 10% chance
      setWeatherMultiplier(1.5);
      toast.info("Note: Extreme weather conditions detected at this location (1.5× multiplier applies)");
    } else if (randomCondition > 0.7) {
      // Severe weather - 20% chance
      setWeatherMultiplier(1.2);
      toast.info("Note: Rainy conditions detected at this location (1.2× multiplier applies)");
    } else {
      // Normal weather - 70% chance
      setWeatherMultiplier(1.0);
    }
  };

  // Manual address validation for when Google Maps API fails
  const handleManualAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPropertyInput(value);
    
    // Simple validation for non-empty address
    if (value.trim().length > 10) {
      setIsValidAddress(true);
      // Use a default location if we can't get real coordinates
      setCoordinates({ lat: 34.0522, lng: -118.2437 }); // Los Angeles coordinates as fallback
    } else {
      setIsValidAddress(false);
      setCoordinates(null);
    }
    
    validateField('property', value);
  };

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
    
    // If Google Maps is working, validate address from autocomplete
    // Otherwise accept manual entry if it looks reasonable
    if (!googleMapsError && !isValidAddress) {
      newErrors.property = "Please select a valid address from the suggestions";
    } else if (googleMapsError && propertyInput.trim().length < 10) {
      newErrors.property = "Please enter a complete address";
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
    
    // Allow submission with manually entered address if Google Maps failed
    if (!googleMapsError && !coordinates) {
      toast.error("Please select a valid address from the suggestions");
      return;
    }
    
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
        price: 25, // Base price - will be recalculated in CartContext
        landlordInfo, // Always include landlord info
        coordinates: coordinates || { lat: 34.0522, lng: -118.2437 }, // Fallback coordinates if needed
        pricing: {
          baseFee: 25,
          distanceSurcharge: 0, // Will be calculated in CartContext
          weatherMultiplier,
          finalPrice: 25 * weatherMultiplier // Will be recalculated in CartContext
        }
      });
      
      // Show success notification with pricing information
      toast.success("Property added to cart", {
        description: `Base fee: $25 ${weatherMultiplier > 1 ? `• Weather adjustment: ${weatherMultiplier}×` : ''}`
      });
      
      // Reset form
      setPropertyInput('');
      setFormattedAddress('');
      setAgentName('');
      setAgentEmail('');
      setAgentPhone('');
      setAgentCompany('');
      setCoordinates(null);
      setIsValidAddress(false);
      setWeatherMultiplier(1.0);
      
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
    // Instead of showing a full-screen error, we'll just display a warning toast
    // and continue to render the form with manual address entry
    useEffect(() => {
      toast.warning("Address autocomplete unavailable", {
        description: "You can still enter an address manually"
      });
    }, []);
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
                    {googleMapsError && (
                      <span className="ml-2 text-sm text-amber-600">(Manual entry)</span>
                    )}
                  </Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute top-3 left-3 text-muted-foreground h-5 w-5" />
                    {!isLoaded && !loadError ? (
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
                        placeholder={googleMapsError ? "Enter full property address..." : "Start typing an address..."}
                        value={propertyInput}
                        onChange={(e) => {
                          if (googleMapsError) {
                            // Manual input handling when Google Maps fails
                            handleManualAddressInput(e);
                          } else {
                            // Normal handling when autocomplete works
                            setPropertyInput(e.target.value);
                            setIsValidAddress(false);
                            validateField('property', e.target.value);
                          }
                        }}
                      />
                    )}
                  </div>
                  {errors.property && <p className="text-sm text-red-500 mt-1">{errors.property}</p>}
                  {formattedAddress && !googleMapsError && (
                    <div className="mt-2 p-2 bg-primary/5 border rounded text-sm">
                      <p className="font-medium">Selected address:</p>
                      <p>{formattedAddress}</p>
                      {coordinates && (
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <span>Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
                          {weatherMultiplier > 1 && (
                            <div className="ml-2 flex items-center text-amber-600">
                              <CloudRain className="h-3 w-3 mr-1" />
                              <span>{weatherMultiplier === 1.5 ? "Extreme weather" : "Rainy conditions"} ({weatherMultiplier}×)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {googleMapsError && propertyInput.trim().length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                      <p>Address autocomplete is unavailable. Please enter a complete address manually.</p>
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
                  (!googleMapsError && !isValidAddress) ||
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
              
              {isValidAddress && (
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  Base fee: $25 {weatherMultiplier > 1 ? `• Weather adjustment: ${weatherMultiplier}×` : ''}
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </section>
      
      <section className="bg-secondary py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          
          {/* Replace the grid with the ProoflyRoadmap component */}
          <ProoflyRoadmap />
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
