
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { ArrowRight, Check, Laptop, MapPin, PieChart, Shield, Star, Users } from 'lucide-react';
import { PropertyForm } from '@/components/PropertyForm';
import { ProoflyRoadmap } from '@/components/ProoflyRoadmap';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Demo Request Received",
      description: "We'll be in touch with you soon!"
    });
    setEmail('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="bg-white px-4 md:px-6 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12">
            <div className="space-y-8 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm">
                <span className="text-[#FF385C] font-medium mr-1">New</span>
                <span className="text-gray-800">Simplified property evaluation process</span>
              </div>
              
              <div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                  Optimize, <span className="text-[#FF385C]">Outperform</span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                  Get professional property assessments quickly and easily with our streamlined platform. No hassle, no waiting.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-[#FF385C] hover:bg-[#e0334f] text-white rounded-md py-6 px-8 text-lg shadow-md"
                  onClick={() => document.getElementById('property-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Start Your Evaluation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-800 hover:bg-gray-50 py-6 px-8 text-lg"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Statistics Section with Enhanced Design */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform delivers exceptional results through data-driven evaluations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md bg-white p-8 rounded-xl transition-transform hover:scale-105">
              <CardContent className="p-0 space-y-2">
                <h3 className="text-6xl font-bold text-[#FF385C]">90%</h3>
                <p className="text-xl text-gray-700">of our clients come back for repeat evaluations</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-white p-8 rounded-xl transition-transform hover:scale-105">
              <CardContent className="p-0 space-y-2">
                <h3 className="text-6xl font-bold text-[#FF385C]">2x</h3>
                <p className="text-xl text-gray-700">faster than traditional property evaluation services</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-white p-8 rounded-xl transition-transform hover:scale-105">
              <CardContent className="p-0 space-y-2">
                <h3 className="text-6xl font-bold text-[#FF385C]">50%</h3>
                <p className="text-xl text-gray-700">more comprehensive reports than competitors</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Property Form Section with Enhanced Design */}
      <section id="property-form" className="bg-white px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Start Your Property Evaluation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fill out the form below to begin your property evaluation process. Our experts will take care of the rest.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <PropertyForm />
          </div>
        </div>
      </section>

      {/* How It Works Section with Enhanced Design */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes property evaluation simple and efficient
            </p>
          </div>
          
          <div className="mt-12">
            <ProoflyRoadmap />
          </div>
        </div>
      </section>

      {/* Features Section with Numbered List Design */}
      <section className="bg-white px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Future Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're constantly improving our platform to better serve your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <span className="feature-number">01</span>
              <Card className="border border-gray-200 hover:border-[#FF385C] transition-all rounded-xl overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="rounded-full bg-[#FF385C]/10 p-4 mb-4">
                    <Users className="h-8 w-8 text-[#FF385C]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Landlord Dashboards</h3>
                  <p className="text-gray-600">Comprehensive analytics and management tools for property owners</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="feature-card">
              <span className="feature-number">02</span>
              <Card className="border border-gray-200 hover:border-[#FF385C] transition-all rounded-xl overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="rounded-full bg-[#FF385C]/10 p-4 mb-4">
                    <Shield className="h-8 w-8 text-[#FF385C]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Escrow Deposit System</h3>
                  <p className="text-gray-600">Secure payment processing and escrow services for transactions</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="feature-card">
              <span className="feature-number">03</span>
              <Card className="border border-gray-200 hover:border-[#FF385C] transition-all rounded-xl overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="rounded-full bg-[#FF385C]/10 p-4 mb-4">
                    <Laptop className="h-8 w-8 text-[#FF385C]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Full Onboarding</h3>
                  <p className="text-gray-600">Seamless onboarding experience with guided setup assistance</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="feature-card">
              <span className="feature-number">04</span>
              <Card className="border border-gray-200 hover:border-[#FF385C] transition-all rounded-xl overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="rounded-full bg-[#FF385C]/10 p-4 mb-4">
                    <PieChart className="h-8 w-8 text-[#FF385C]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Automated Reporting</h3>
                  <p className="text-gray-600">Intelligent report generation with customizable templates</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Enhanced Design */}
      <section className="bg-gray-900 px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-full h-full bg-[#FF385C] transform rotate-12 translate-x-1/2 translate-y-1/4"></div>
        </div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied clients who trust Proofly for their property evaluation needs
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleDemoRequest} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-gray-700 text-white placeholder:text-gray-400 h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                type="submit" 
                className="bg-[#FF385C] hover:bg-[#e0334f] text-white h-12 font-medium"
              >
                Request a Demo
              </Button>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        .feature-card {
          position: relative;
        }
        .feature-number {
          position: absolute;
          top: -10px;
          left: 10px;
          font-size: 1.5rem;
          font-weight: 700;
          color: rgba(255, 56, 92, 0.7);
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default Home;
