
import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Search, Building, ShieldCheck, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AgentContact } from '@/services/api';

const Home: React.FC = () => {
  const { addProperty } = useCart();
  const [propertyInput, setPropertyInput] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentCompany, setAgentCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentFields, setShowAgentFields] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
    
    // Collect agent contact info if provided
    let agentContact: AgentContact | undefined;
    
    if (showAgentFields && agentName && agentEmail && agentPhone) {
      agentContact = {
        name: agentName,
        email: agentEmail,
        phone: agentPhone,
        company: agentCompany || undefined
      };
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addProperty({
      id: crypto.randomUUID(), // Generate a unique ID
      address: propertyInput,
      description: '',
      price: 30, // Default price
      agentContact // Pass agent contact along with the property
    });
    
    // Reset form
    setPropertyInput('');
    setAgentName('');
    setAgentEmail('');
    setAgentPhone('');
    setAgentCompany('');
    setShowAgentFields(false);
    setIsLoading(false);
  };
  
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
                    <textarea
                      id="property"
                      className={`w-full p-3 pl-10 border rounded-lg h-24 focus:ring-2 focus:outline-none ${
                        errors.property ? 'border-red-500 focus:ring-red-200' : 'focus:ring-primary focus:border-primary'
                      }`}
                      placeholder="Enter full property address here..."
                      value={propertyInput}
                      onChange={(e) => setPropertyInput(e.target.value)}
                    />
                  </div>
                  {errors.property && <p className="text-sm text-red-500 mt-1">{errors.property}</p>}
                </div>
                
                {/* Toggle for agent/landlord information */}
                <div className="flex items-center my-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAgentFields(!showAgentFields)}
                  >
                    {showAgentFields ? 'Hide Agent/Landlord Info' : 'Add Agent/Landlord Info (Required)'}
                  </Button>
                </div>
                
                {/* Agent/Landlord information fields */}
                {showAgentFields && (
                  <div className="space-y-4 mt-2 p-4 bg-muted/30 rounded-lg border">
                    <h3 className="font-medium">Agent/Landlord Information</h3>
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="agentName">Name</Label>
                        <Input
                          id="agentName"
                          placeholder="Full name"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          className={errors.agentName ? 'border-red-500' : ''}
                        />
                        {errors.agentName && <p className="text-sm text-red-500 mt-1">{errors.agentName}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="agentEmail">Email</Label>
                        <Input
                          id="agentEmail"
                          type="email"
                          placeholder="email@example.com"
                          value={agentEmail}
                          onChange={(e) => setAgentEmail(e.target.value)}
                          className={errors.agentEmail ? 'border-red-500' : ''}
                        />
                        {errors.agentEmail && <p className="text-sm text-red-500 mt-1">{errors.agentEmail}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="agentPhone">Phone</Label>
                        <Input
                          id="agentPhone"
                          placeholder="555-123-4567"
                          value={agentPhone}
                          onChange={(e) => setAgentPhone(e.target.value)}
                          className={errors.agentPhone ? 'border-red-500' : ''}
                        />
                        {errors.agentPhone && <p className="text-sm text-red-500 mt-1">{errors.agentPhone}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="agentCompany">Company (Optional)</Label>
                        <Input
                          id="agentCompany"
                          placeholder="Company name"
                          value={agentCompany}
                          onChange={(e) => setAgentCompany(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="mt-6 w-full"
                disabled={!propertyInput.trim() || isLoading || (showAgentFields && (!agentName || !agentEmail || !agentPhone))}
              >
                {isLoading ? "Processing..." : "Add to Cart"}
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
