
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { MapPin, ShoppingCart, Phone, Calendar, CheckCircle, Clock, User, Route, FileText, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RoadmapStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  index: number;
}

const RoadmapStep: React.FC<RoadmapStepProps> = ({ icon, title, description, status, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className={cn(
          "rounded-full p-2 w-10 h-10 flex items-center justify-center",
          status === 'completed' ? "bg-green-500 text-white" : 
          status === 'active' ? "bg-primary text-white" : 
          "bg-muted text-muted-foreground"
        )}>
          {status === 'active' ? 
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {icon}
            </motion.div> : 
            icon
          }
        </div>
        {index < 4 && <div className={cn(
          "w-0.5 h-12 mt-2",
          status === 'completed' ? "bg-green-500" : "bg-muted"
        )} />}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <div className="mt-6 mb-6">
          {index === 0 && <PropertyInputSimulation status={status} />}
          {index === 1 && <AIOutreachSimulation status={status} />}
          {index === 2 && <EvaluatorMatchingSimulation status={status} />}
          {index === 3 && <EvaluationTrackingSimulation status={status} />}
          {index === 4 && <ReportDeliverySimulation status={status} />}
        </div>
      </div>
    </motion.div>
  );
};

// Property Input Simulation
const PropertyInputSimulation: React.FC<{status: string}> = ({ status }) => {
  return (
    <Card className={cn("bg-muted/30", status === 'active' || status === 'completed' ? "border-primary" : "")}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">123 Main Street, Apt 4B</p>
            <p className="text-xs text-muted-foreground">New York, NY 10001</p>
          </div>
          <div className="bg-primary/10 px-2 py-1 rounded text-xs font-medium text-primary">$30</div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Landlord: John Smith</p>
            <p className="text-xs text-muted-foreground">+1 (555) 123-4567</p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="w-full gap-2"
          variant={status === 'completed' ? "outline" : "default"}
        >
          <ShoppingCart className="h-4 w-4" />
          {status === 'completed' ? "Added to Cart" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
};

// AI Outreach Simulation
const AIOutreachSimulation: React.FC<{status: string}> = ({ status }) => {
  const isActive = status === 'active';
  const [outreachStep, setOutreachStep] = useState(isActive ? 0 : status === 'completed' ? 3 : 0);
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    if (!isActive) {
      return;
    }
    
    const timer = setTimeout(() => {
      if (outreachStep < 3) {
        setOutreachStep(prev => prev + 1);
      }
    }, 2000);
    
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 60);
    
    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [isActive, outreachStep]);

  return (
    <Card className={cn("bg-muted/30", isActive || status === 'completed' ? "border-primary" : "")}>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">AI Outreach Progress</p>
            <p className="text-xs font-medium">{progress}%</p>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              outreachStep >= 1 ? "bg-green-500 text-white" : outreachStep === 0 && isActive ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
            )}>
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Contacting Landlord</p>
              <p className="text-xs text-muted-foreground">Dialing John Smith at +1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              outreachStep >= 2 ? "bg-green-500 text-white" : outreachStep === 1 && isActive ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
            )}>
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Scheduling Viewing</p>
              <p className="text-xs text-muted-foreground">Finding available time slots</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              outreachStep >= 3 ? "bg-green-500 text-white" : outreachStep === 2 && isActive ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
            )}>
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Viewing Confirmed</p>
              {outreachStep >= 3 ? (
                <p className="text-xs text-green-600 font-medium">Scheduled for tomorrow at 2:00 PM</p>
              ) : (
                <p className="text-xs text-muted-foreground">Awaiting confirmation...</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Evaluator Matching Simulation
const EvaluatorMatchingSimulation: React.FC<{status: string}> = ({ status }) => {
  const isActive = status === 'active';
  const [matchStep, setMatchStep] = useState(isActive ? 0 : status === 'completed' ? 4 : 0);
  
  React.useEffect(() => {
    if (!isActive) {
      return;
    }
    
    const timer = setTimeout(() => {
      if (matchStep < 4) {
        setMatchStep(prev => prev + 1);
      }
    }, 1500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [isActive, matchStep]);

  return (
    <Card className={cn("bg-muted/30", isActive || status === 'completed' ? "border-primary" : "")}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Sarah Johnson</p>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-3 h-3 ${i < 5 ? "text-yellow-400" : "text-gray-300"}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-medium">4.9</span>
              <span className="text-xs text-muted-foreground ml-1">(241 evaluations)</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-32 bg-muted/50 rounded-md overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">Map Visualization</div>
          
          {(isActive || status === 'completed') && (
            <div className="absolute bottom-2 right-2 bg-card shadow rounded-md p-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    matchStep >= 1 ? "bg-green-500 text-white" : matchStep === 0 && isActive ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
                  )}>
                    <Route className="h-2 w-2" />
                  </div>
                  <span>En route</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    matchStep >= 2 ? "bg-green-500 text-white" : matchStep === 1 && isActive ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
                  )}>
                    <MapPin className="h-2 w-2" />
                  </div>
                  <span>Arrived</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    matchStep >= 3 ? "bg-green-500 text-white" : matchStep === 2 && isActive ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
                  )}>
                    <Clock className="h-2 w-2" />
                  </div>
                  <span>Evaluating</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    matchStep >= 4 ? "bg-green-500 text-white" : matchStep === 3 && isActive ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
                  )}>
                    <CheckCircle className="h-2 w-2" />
                  </div>
                  <span>Complete</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Evaluation Tracking Simulation
const EvaluationTrackingSimulation: React.FC<{status: string}> = ({ status }) => {
  return (
    <Card className={cn("bg-muted/30", status === 'active' || status === 'completed' ? "border-primary" : "")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Order #PRF-123456</h4>
          <div className={cn(
            "text-xs px-2 py-1 rounded-full",
            status === 'completed' ? "bg-green-100 text-green-800" : status === 'active' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {status === 'completed' ? "Completed" : status === 'active' ? "In Progress" : "Pending"}
          </div>
        </div>
        
        <Progress value={status === 'completed' ? 100 : status === 'active' ? 60 : 0} className="h-1.5" />
        
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-card">
            <CardContent className="p-3 flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                status === 'completed' || status === 'active' ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              )}>
                <CheckCircle className="h-3 w-3" />
              </div>
              <div>
                <p className="text-xs font-medium">123 Main St</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardContent className="p-3 flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                status === 'completed' ? "bg-green-500 text-white" : status === 'active' ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
              )}>
                {status === 'active' ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
              </div>
              <div>
                <p className="text-xs font-medium">456 Park Ave</p>
                <p className="text-xs text-muted-foreground">
                  {status === 'completed' ? "Completed" : status === 'active' ? "In Progress" : "Pending"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          disabled={status === 'pending'}
        >
          View Dashboard
        </Button>
      </CardContent>
    </Card>
  );
};

// Report Delivery Simulation
const ReportDeliverySimulation: React.FC<{status: string}> = ({ status }) => {
  return (
    <Card className={cn("bg-muted/30", status === 'active' || status === 'completed' ? "border-primary" : "")}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-md flex items-center justify-center",
            status === 'completed' || status === 'active' ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
          )}>
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Property Evaluation Report</p>
            <p className="text-xs text-muted-foreground">2 properties evaluated • May 1, 2025</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm border-t border-b py-2">
          <span>123 Main Street</span>
          <span className="text-green-600 font-medium">Pass</span>
        </div>
        
        <div className="flex items-center justify-between text-sm border-b py-2">
          <span>456 Park Avenue</span>
          <span className="text-green-600 font-medium">Pass</span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button variant="default" size="sm" className="flex-1 gap-2">
            <FileText className="h-4 w-4" />
            View Full Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProoflyRoadmap = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [view, setView] = useState<'linear' | 'cards'>('linear');

  const steps = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Property Input Phase",
      description: "Enter your property details and landlord information to begin the evaluation process.",
      status: activeStep >= 0 ? activeStep === 0 ? 'active' : 'completed' : 'pending',
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "AI Outreach Phase",
      description: "Our AI system automatically contacts landlords to schedule property viewings.",
      status: activeStep >= 1 ? activeStep === 1 ? 'active' : 'completed' : 'pending',
    },
    {
      icon: <User className="h-5 w-5" />,
      title: "Evaluator Matching Phase",
      description: "We match you with a qualified property evaluator in your area.",
      status: activeStep >= 2 ? activeStep === 2 ? 'active' : 'completed' : 'pending',
    },
    {
      icon: <Route className="h-5 w-5" />,
      title: "Evaluation Tracking Phase",
      description: "Track your evaluator's progress through each property in real-time.",
      status: activeStep >= 3 ? activeStep === 3 ? 'active' : 'completed' : 'pending',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Report Delivery Phase",
      description: "Receive comprehensive property evaluation reports with detailed insights.",
      status: activeStep >= 4 ? activeStep === 4 ? 'active' : 'completed' : 'pending',
    }
  ];

  // Simulate progression through the roadmap
  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setActiveStep(0); // Restart the demo
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 bg-muted/30 border-b">
        <h2 className="text-2xl font-semibold text-center">Proofly User Journey</h2>
        <p className="text-center text-muted-foreground mt-2">
          From property submission to evaluation report delivery
        </p>
        
        <Tabs defaultValue="linear" className="mt-6" onValueChange={(val) => setView(val as 'linear' | 'cards')}>
          <TabsList className="grid grid-cols-2 w-[400px] mx-auto">
            <TabsTrigger value="linear">Linear View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="p-6 space-y-6">
        {view === 'linear' && (
          <div className="space-y-8">
            {steps.map((step, index) => (
              <RoadmapStep 
                key={index}
                icon={step.icon}
                title={step.title}
                description={step.description}
                status={step.status as 'completed' | 'active' | 'pending'}
                index={index}
              />
            ))}
          </div>
        )}
        
        {view === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <Card 
                key={index}
                className={cn(
                  "border transition-colors",
                  step.status === 'active' ? "border-primary bg-primary/5" : 
                  step.status === 'completed' ? "border-green-500" : ""
                )}
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-3 items-center">
                    <div className={cn(
                      "rounded-full p-2 w-10 h-10 flex items-center justify-center",
                      step.status === 'completed' ? "bg-green-500 text-white" : 
                      step.status === 'active' ? "bg-primary text-white" : 
                      "bg-muted text-muted-foreground"
                    )}>
                      {step.status === 'active' ? 
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          {step.icon}
                        </motion.div> : 
                        step.icon
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <div className={cn(
                        "text-xs px-2 py-0.5 rounded-full inline-block",
                        step.status === 'completed' ? "bg-green-100 text-green-800" : 
                        step.status === 'active' ? "bg-primary/20 text-primary" : 
                        "bg-muted text-muted-foreground"
                      )}>
                        {step.status === 'completed' ? "Completed" : 
                         step.status === 'active' ? "In Progress" : "Pending"}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  {index === 0 && step.status === 'active' && <PropertyInputSimulation status={step.status} />}
                  {index === 1 && step.status === 'active' && <AIOutreachSimulation status={step.status} />}
                  {index === 2 && step.status === 'active' && <EvaluatorMatchingSimulation status={step.status} />}
                  {index === 3 && step.status === 'active' && <EvaluationTrackingSimulation status={step.status} />}
                  {index === 4 && step.status === 'active' && <ReportDeliverySimulation status={step.status} />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex justify-center mt-8">
          <Button onClick={handleNextStep} size="lg" className="gap-2">
            {activeStep === steps.length - 1 ? (
              <>Restart Demo <Loader2 className="h-4 w-4" /></>
            ) : (
              <>Next Step <Loader2 className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProoflyRoadmap;
