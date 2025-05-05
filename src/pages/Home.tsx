import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { ArrowRight, Check, Laptop, MapPin, PieChart, Shield, Star, Users, Mail } from 'lucide-react';
import { PropertyForm } from '@/components/PropertyForm';
import { ProoflyWorkflowStages } from '@/components/ProoflyWorkflowStages';
import emailjs from 'emailjs-com';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Open the contact modal to collect more information
    setIsContactModalOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepare the template parameters for EmailJS
    const templateParams = {
      to_email: "your-email@example.com", // Replace with your email address
      from_email: email,
      subject: subject,
      message: message
    };
    
    // Send the email using EmailJS
    // You'll need to replace the service_id, template_id, and user_id with your own
    emailjs.send(
      'YOUR_SERVICE_ID',  // Replace with your EmailJS service ID
      'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
      templateParams,
      'YOUR_USER_ID'      // Replace with your EmailJS user ID
    )
    .then((response) => {
      console.log('Email sent successfully:', response);
      toast({
        title: "Message Sent",
        description: "Thank you! We'll be in touch with you soon.",
      });
      
      // Reset form fields and close modal
      setEmail('');
      setSubject('');
      setMessage('');
      setIsContactModalOpen(false);
    })
    .catch((error) => {
      console.error('Email sending failed:', error);
      toast({
        title: "Message Failed",
        description: "There was an error sending your message. Please try again later.",
        variant: "destructive"
      });
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Enhanced Hero Section with Glassmorphic Design */}
      <section className="relative bg-white px-4 md:px-6 py-20 md:py-28 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1470813740244-df37b8c1edcb" 
            alt="Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/70"></div>
        </div>
        
        {/* Glassmorphic container */}
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid gap-12">
            <div className="space-y-8 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm border border-gray-200/50 shadow-sm">
                <span className="text-[#FF385C] font-medium mr-1">New</span>
                <span className="text-gray-800">Simplified property evaluation process</span>
              </div>
              
              <div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                  Optimize, <span className="text-[#FF385C]">Outperform</span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto backdrop-blur-sm bg-white/30 p-4 rounded-lg">
                  Get professional property assessments quickly and easily with our streamlined platform. No hassle, no waiting.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-[#FF385C] hover:bg-[#e0334f] text-white rounded-md py-6 px-8 text-lg shadow-md backdrop-blur-sm bg-[#FF385C]/90"
                  onClick={() => document.getElementById('property-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Start Your Evaluation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-gray-300 bg-white/70 backdrop-blur-sm text-gray-800 hover:bg-gray-50 py-6 px-8 text-lg"
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

      {/* How It Works Section - Replaced with ProoflyWorkflowStages */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes property evaluation simple and efficient
            </p>
          </div>
          
          <div className="mt-12">
            <ProoflyWorkflowStages />
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
            <div className="feature-card relative">
              <span className="feature-number absolute top-[-10px] left-[10px] text-2xl font-bold text-[rgba(255,56,92,0.7)] z-10">01</span>
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
            
            <div className="feature-card relative">
              <span className="feature-number absolute top-[-10px] left-[10px] text-2xl font-bold text-[rgba(255,56,92,0.7)] z-10">02</span>
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
            
            <div className="feature-card relative">
              <span className="feature-number absolute top-[-10px] left-[10px] text-2xl font-bold text-[rgba(255,56,92,0.7)] z-10">03</span>
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
            
            <div className="feature-card relative">
              <span className="feature-number absolute top-[-10px] left-[10px] text-2xl font-bold text-[rgba(255,56,92,0.7)] z-10">04</span>
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
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4">
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
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Send us a message</h3>
                <button 
                  onClick={() => setIsContactModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form ref={formRef} onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsContactModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#FF385C] hover:bg-[#e0334f] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
