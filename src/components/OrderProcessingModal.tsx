import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Building, CheckCircle, MapPin, Clock, Loader2, MessageSquare, CalendarCheck, Calendar } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import PropertyMap from './PropertyMap';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarIcon } from 'lucide-react';
import { Property } from '@/context/CartContext';
import { Evaluator } from './EvaluatorProfile';

interface OrderProcessingModalProps {
  properties: Property[];
  onComplete: () => void;
}

// Step durations (in milliseconds)
const STEP_DURATIONS = {
  MATCHING: 6000,
  OUTREACH: 8000,
  EVALUATION: 6000,
  REPORT: 5000,
  COMPLETION: 3000
};

const OrderProcessingModal: React.FC<OrderProcessingModalProps> = ({ properties, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [evaluator, setEvaluator] = useState<Evaluator | null>(null);
  const [outreachStatus, setOutreachStatus] = useState<'initial' | 'contacting' | 'scheduled'>('initial');
  const [scheduledProperties, setScheduledProperties] = useState<{ [id: string]: string }>({});
  
  // Calculate total steps: 
  // 1 step for matching
  // 1-3 steps for outreach per property (initial outreach, contacting, scheduling)
  // 4 steps per property for evaluation (en route, arrived, evaluating, completed)
  // 1 step for report generation
  // 1 step for completion
  const outreachStepsPerProperty = 3;
  const evalStepsPerProperty = 4;
  const totalOutreachSteps = properties.length * outreachStepsPerProperty;
  const totalEvalSteps = properties.length * evalStepsPerProperty;
  const totalSteps = 1 + totalOutreachSteps + totalEvalSteps + 1 + 1;
  
  // Calculate which phase we're in
  const matchingThreshold = 1;
  const outreachThreshold = matchingThreshold + totalOutreachSteps;
  const evaluationThreshold = outreachThreshold + totalEvalSteps;
  const reportThreshold = evaluationThreshold + 1;
  
  // Calculate which property we're working on based on the current step
  const getPropertyIndexForStep = (step: number) => {
    if (step < matchingThreshold) return -1; // Not on a property yet
    
    if (step < outreachThreshold) {
      // In outreach phase
      const outreachStep = step - matchingThreshold;
      return Math.floor(outreachStep / outreachStepsPerProperty);
    } else if (step < evaluationThreshold) {
      // In evaluation phase
      const evalStep = step - outreachThreshold;
      return Math.floor(evalStep / evalStepsPerProperty);
    }
    
    return -1; // Past property-specific phases
  };
  
  // Get the current property index
  const currentPropertyIndex = getPropertyIndexForStep(currentStep);
  
  // Calculate which sub-step we're on for the current property
  const getSubStepForProperty = (step: number) => {
    if (step < matchingThreshold) return -1;
    
    if (step < outreachThreshold) {
      // In outreach phase
      const outreachStep = step - matchingThreshold;
      return outreachStep % outreachStepsPerProperty;
    } else if (step < evaluationThreshold) {
      // In evaluation phase
      const evalStep = step - outreachThreshold;
      return evalStep % evalStepsPerProperty;
    }
    
    return -1;
  };
  
  const currentSubStep = getSubStepForProperty(currentStep);

  // Generate random future dates for property viewings
  const generateViewingDates = () => {
    const dates: { [id: string]: string } = {};
    const today = new Date();
    
    properties.forEach(property => {
      // Random days in the future (1-5)
      const daysToAdd = Math.floor(Math.random() * 5) + 1;
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + daysToAdd);
      
      // Random hour between 9am and 5pm
      const hour = Math.floor(Math.random() * 9) + 9;
      scheduledDate.setHours(hour, 0, 0, 0);
      
      const formattedDate = scheduledDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      
      dates[property.id] = formattedDate;
    });
    
    return dates;
  };

  useEffect(() => {
    // Set mock evaluator when matched (after step 0)
    if (currentStep === 1) {
      setEvaluator({
        id: "e123",
        name: "Alex Johnson",
        avatar: "/placeholder.svg",
        avatarUrl: "/placeholder.svg", // Now properly set the required field
        rating: 4.8,
        properties: 352,
        experience: "5 years",
        evaluationsCompleted: 352,
        bio: "Professional property evaluator with 7+ years of experience. Specialized in residential properties."
      });
      
      // Generate scheduled dates for property viewings
      setScheduledProperties(generateViewingDates());
    }
    
    // Update outreach status based on step
    if (currentStep >= matchingThreshold && currentStep < outreachThreshold) {
      const subStep = currentSubStep;
      if (subStep === 0) setOutreachStatus('initial');
      else if (subStep === 1) setOutreachStatus('contacting');
      else if (subStep === 2) setOutreachStatus('scheduled');
    }
    
    // Start the simulation
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        
        // If we've reached the last step, clear the interval and call onComplete
        if (nextStep >= totalSteps) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 1000); // Give a second for the user to see the final state
          return prev;
        }
        
        return nextStep;
      });
    }, 
    // Adjust timing based on the current phase
    currentStep < matchingThreshold ? STEP_DURATIONS.MATCHING :
    currentStep < outreachThreshold ? STEP_DURATIONS.OUTREACH :
    currentStep < evaluationThreshold ? STEP_DURATIONS.EVALUATION :
    currentStep < reportThreshold ? STEP_DURATIONS.REPORT :
    STEP_DURATIONS.COMPLETION
    );
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const targetProgress = (currentStep / totalSteps) * 100;
        const step = 2;
        const nextProgress = Math.min(prev + step, targetProgress);
        
        if (nextProgress >= 100) {
          clearInterval(progressInterval);
        }
        
        return nextProgress;
      });
    }, 100);
    
    // Cleanup
    return () => {
      clearInterval(timer);
      clearInterval(progressInterval);
    };
  }, [currentStep, totalSteps, onComplete, currentSubStep, matchingThreshold, outreachThreshold, evaluationThreshold, reportThreshold]);
  
  // Get current step message
  const getStepMessage = () => {
    if (currentStep === 0) {
      return "Matching you with an evaluator...";
    } else if (currentStep >= reportThreshold) {
      return "Report ready! Redirecting to your dashboard...";
    } else if (currentStep >= evaluationThreshold) {
      return "Generating consolidated report...";
    } else if (currentStep >= outreachThreshold) {
      // Evaluation phase
      const property = properties[currentPropertyIndex];
      if (!property) return "Processing...";
      
      const address = property.address.split(',')[0]; // Get first part of address for brevity
      
      switch (currentSubStep) {
        case 0:
          return `Evaluator en route to ${address}...`;
        case 1:
          return `Evaluator has arrived at ${address}...`;
        case 2:
          return `Performing evaluation at ${address}...`;
        case 3:
          return `Completed evaluation at ${address}.`;
        default:
          return "Processing...";
      }
    } else if (currentStep >= matchingThreshold) {
      // Outreach phase
      const property = properties[currentPropertyIndex];
      if (!property) return "Processing...";
      
      const address = property.address.split(',')[0];
      const landlordName = property.landlordInfo?.name || "landlord";
      
      switch (currentSubStep) {
        case 0:
          return `Reaching out to ${landlordName} for property at ${address}...`;
        case 1:
          return `Discussing available viewing times for ${address}...`;
        case 2:
          const viewingDate = scheduledProperties[property.id] || "soon";
          return `Viewing scheduled for ${address} on ${viewingDate}`;
        default:
          return "Processing...";
      }
    }
    
    return "Processing...";
  };
  
  // Get icon for current step
  const getStepIcon = () => {
    if (currentStep === 0) {
      return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
    } else if (currentStep >= reportThreshold) {
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    } else if (currentStep >= evaluationThreshold) {
      return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
    } else if (currentStep >= outreachThreshold) {
      // Evaluation phases
      switch (currentSubStep) {
        case 0:
          return <MapPin className="h-12 w-12 text-primary" />;
        case 1:
          return <Building className="h-12 w-12 text-primary" />;
        case 2:
          return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
        case 3:
          return <CheckCircle className="h-12 w-12 text-green-500" />;
        default:
          return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      }
    } else if (currentStep >= matchingThreshold) {
      // Outreach phases
      switch (currentSubStep) {
        case 0:
          return <MessageSquare className="h-12 w-12 text-primary" />;
        case 1:
          return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
        case 2:
          return <CalendarCheck className="h-12 w-12 text-green-500" />;
        default:
          return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      }
    }
    
    return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
  };

  // Render star rating component
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return <div className="flex items-center">{stars}</div>;
  };
  
  // Function to determine if we're in the outreach phase
  const isInOutreachPhase = () => {
    return currentStep >= matchingThreshold && currentStep < outreachThreshold;
  };
  
  // Function to determine if we're in the evaluation phase
  const isInEvaluationPhase = () => {
    return currentStep >= outreachThreshold && currentStep < evaluationThreshold;
  };
  
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card shadow-lg rounded-lg p-6 max-w-5xl w-full mx-4">
        <div className="flex flex-col items-center justify-center mb-6">
          {getStepIcon()}
          <h2 className="text-xl font-semibold mt-4 text-center">{getStepMessage()}</h2>
        </div>

        {evaluator && currentStep > 0 && (
          <div className="mb-6 border-b pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={evaluator.avatarUrl || evaluator.avatar} alt={evaluator.name} />
                <AvatarFallback>{evaluator.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{evaluator.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {renderRating(evaluator.rating)}
                  <span className="text-sm font-medium">{evaluator.rating}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline">{evaluator.properties} properties</Badge>
                  <Badge variant="outline">{evaluator.experience}</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outreach visualization for landlord communication */}
        {isInOutreachPhase() && currentPropertyIndex >= 0 && (
          <div className="mb-6 border rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">AI Outreach Progress</h3>
              <Badge variant={outreachStatus === 'scheduled' ? 'secondary' : 'outline'}>
                {outreachStatus === 'initial' ? 'Initial Contact' : 
                 outreachStatus === 'contacting' ? 'Scheduling' : 
                 'Scheduled'}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className={`flex items-start gap-3 ${outreachStatus !== 'initial' ? 'opacity-70' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  outreachStatus === 'initial' ? 'bg-primary text-white animate-pulse' : 
                  outreachStatus === 'contacting' || outreachStatus === 'scheduled' ? 'bg-green-500 text-white' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Contacting Landlord</p>
                  <p className="text-sm text-muted-foreground">
                    {properties[currentPropertyIndex]?.landlordInfo?.name || "Landlord"} has been contacted about the property viewing request.
                  </p>
                </div>
              </div>
              
              <div className={`flex items-start gap-3 ${outreachStatus !== 'contacting' ? 'opacity-70' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  outreachStatus === 'contacting' ? 'bg-primary text-white animate-pulse' : 
                  outreachStatus === 'scheduled' ? 'bg-green-500 text-white' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Scheduling Viewing</p>
                  <p className="text-sm text-muted-foreground">
                    Coordinating available times for property evaluation.
                  </p>
                </div>
              </div>
              
              <div className={`flex items-start gap-3 ${outreachStatus !== 'scheduled' ? 'opacity-70' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  outreachStatus === 'scheduled' ? 'bg-primary text-white animate-pulse' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Viewing Confirmed</p>
                  {outreachStatus === 'scheduled' && properties[currentPropertyIndex] ? (
                    <p className="text-sm">
                      Scheduled for <span className="font-medium">{scheduledProperties[properties[currentPropertyIndex].id]}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Waiting for confirmation...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map visualization for evaluation */}
        {isInEvaluationPhase() && currentPropertyIndex >= 0 && (
          <div className="mb-6">
            <PropertyMap 
              properties={properties}
              currentPropertyIndex={currentPropertyIndex}
              currentStep={currentSubStep}
              evaluator={evaluator || undefined}
              className="h-64"
              showAllProperties={true}
            />
          </div>
        )}
        
        <div className="space-y-2 mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep + 1} of {totalSteps}: {getStepMessage()}
          </p>
        </div>
        
        {/* Progress phases indicator */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className={`p-2 text-center rounded-md border ${currentStep < outreachThreshold ? 'bg-primary/10 border-primary' : 'bg-muted/30'}`}>
            <p className="text-xs font-medium">Outreach & Scheduling</p>
          </div>
          <div className={`p-2 text-center rounded-md border ${currentStep >= outreachThreshold && currentStep < evaluationThreshold ? 'bg-primary/10 border-primary' : 'bg-muted/30'}`}>
            <p className="text-xs font-medium">Property Evaluation</p>
          </div>
          <div className={`p-2 text-center rounded-md border ${currentStep >= evaluationThreshold ? 'bg-primary/10 border-primary' : 'bg-muted/30'}`}>
            <p className="text-xs font-medium">Report Generation</p>
          </div>
        </div>
        
        {/* Horizontal property carousel */}
        {properties.length > 1 && currentStep > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Properties ({properties.length})</h3>
            <Carousel className="w-full">
              <CarouselContent>
                {properties.map((property, index) => (
                  <CarouselItem key={property.id} className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                    <Card className={`${
                      index === currentPropertyIndex 
                        ? 'border-primary' 
                        : index < currentPropertyIndex 
                          ? 'border-green-500' 
                          : ''
                    } h-full`}>
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                          index === currentPropertyIndex 
                            ? 'bg-primary text-white' 
                            : index < currentPropertyIndex 
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <p className="text-xs text-center truncate w-full">
                          {property.address.split(',')[0]}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {index < currentPropertyIndex 
                            ? 'Completed' 
                            : index === currentPropertyIndex
                              ? isInOutreachPhase() 
                                ? outreachStatus === 'initial' 
                                  ? 'Contacting' 
                                  : outreachStatus === 'contacting' 
                                    ? 'Scheduling' 
                                    : 'Scheduled'
                                : isInEvaluationPhase()
                                  ? currentSubStep === 0 
                                    ? 'En Route' 
                                    : currentSubStep === 1 
                                      ? 'Arrived' 
                                      : currentSubStep === 2 
                                        ? 'Evaluating' 
                                        : 'Completed'
                                  : 'Pending'
                              : 'Pending'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProcessingModal;
