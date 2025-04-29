
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Building, CheckCircle, MapPin, Clock, Loader2 } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import PropertyMap from './PropertyMap';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarIcon } from 'lucide-react';

interface Evaluator {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  properties: number;
  experience: string;
}

interface OrderProcessingModalProps {
  properties: Array<{ id: string; address: string }>;
  onComplete: () => void;
}

const STEP_DURATION = 6000; // 6 seconds per step

const OrderProcessingModal: React.FC<OrderProcessingModalProps> = ({ properties, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [evaluator, setEvaluator] = useState<Evaluator | null>(null);
  
  // Calculate total steps: 
  // 1 step for matching + (4 steps per property) + 1 step for report generation + 1 step for completion
  const totalSteps = 1 + (properties.length * 4) + 1 + 1;
  
  // Current property being evaluated (0-indexed)
  const currentPropertyIndex = Math.max(0, Math.min(
    Math.floor((currentStep - 1) / 4),
    properties.length - 1
  ));
  
  // Current property step (0: en route, 1: arrived, 2: evaluating, 3: completed)
  const propertyStepIndex = currentStep > 0 ? (currentStep - 1) % 4 : -1;

  useEffect(() => {
    // Set mock evaluator when matched (after step 0)
    if (currentStep === 1) {
      setEvaluator({
        id: "e123",
        name: "Alex Johnson",
        avatar: "/placeholder.svg",
        rating: 4.8,
        properties: 352,
        experience: "5 years"
      });
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
    }, STEP_DURATION);
    
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
  }, [currentStep, totalSteps, onComplete]);
  
  // Get current step message
  const getStepMessage = () => {
    if (currentStep === 0) {
      return "Matching you with an evaluator...";
    } else if (currentStep > totalSteps - 2) {
      return "Report ready! Redirecting to your dashboard...";
    } else if (currentStep > totalSteps - 3) {
      return "Generating consolidated report...";
    } else {
      // Property evaluation steps
      const property = properties[currentPropertyIndex];
      const address = property.address.split(',')[0]; // Get first part of address for brevity
      
      switch (propertyStepIndex) {
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
    }
  };
  
  // Get icon for current step
  const getStepIcon = () => {
    if (currentStep === 0) {
      return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
    } else if (currentStep >= totalSteps - 2) {
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    } else if (currentStep >= totalSteps - 3) {
      return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
    } else {
      // Property evaluation steps
      switch (propertyStepIndex) {
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
    }
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
  
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card shadow-lg rounded-lg p-6 max-w-5xl w-full mx-4">
        {currentStep === 0 ? (
          <div className="flex flex-col items-center justify-center mb-6">
            {getStepIcon()}
            <h2 className="text-xl font-semibold mt-4 text-center">{getStepMessage()}</h2>
          </div>
        ) : (
          <>
            {/* Evaluator Profile - Show after matching */}
            {evaluator && (
              <div className="mb-6 border-b pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={evaluator.avatar} alt={evaluator.name} />
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

            {/* Map visualization */}
            <div className="mb-6">
              <PropertyMap 
                properties={properties}
                currentPropertyIndex={currentPropertyIndex}
                currentStep={propertyStepIndex}
                evaluator={evaluator || undefined}
                className="h-64"
                showAllProperties={true}
              />
            </div>
          </>
        )}
        
        <div className="space-y-2 mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep + 1} of {totalSteps}: {getStepMessage()}
          </p>
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
                          {index === currentPropertyIndex 
                            ? propertyStepIndex === 0 
                              ? 'En Route' 
                              : propertyStepIndex === 1 
                                ? 'Arrived' 
                                : propertyStepIndex === 2 
                                  ? 'Evaluating' 
                                  : 'Completed'
                            : index < currentPropertyIndex 
                              ? 'Completed' 
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
