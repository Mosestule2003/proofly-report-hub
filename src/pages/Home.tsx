
import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Search, Building, ShieldCheck } from 'lucide-react';

const Home: React.FC = () => {
  const { addProperty } = useCart();
  const [propertyInput, setPropertyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!propertyInput.trim()) return;
    
    setIsLoading(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addProperty({
      address: propertyInput,
      description: '',
    });
    
    setPropertyInput('');
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
            <div className="relative">
              <textarea
                className="w-full p-4 pl-12 border rounded-lg h-24 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Enter property address or description here..."
                value={propertyInput}
                onChange={(e) => setPropertyInput(e.target.value)}
              />
              <Search className="absolute top-4 left-4 text-muted-foreground h-5 w-5" />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="mt-4 w-full md:w-auto"
              disabled={!propertyInput.trim() || isLoading}
            >
              {isLoading ? "Processing..." : "Add to Cart"}
            </Button>
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
