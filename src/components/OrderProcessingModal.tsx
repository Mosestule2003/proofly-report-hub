
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Building, CheckCircle, MapPin, Clock, Loader2 } from 'lucide-react';

interface OrderProcessingModalProps {
  properties: Array<{ id: string; address: string }>;
  onComplete: () => void;
}

const STEP_DURATION = 6000; // 6 seconds per step

const OrderProcessingModal: React.FC<OrderProcessingModalProps> = ({ properties, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
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
  
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card shadow-lg rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center justify-center mb-6">
          {getStepIcon()}
          <h2 className="text-xl font-semibold mt-4 text-center">{getStepMessage()}</h2>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        
        {properties.length > 1 && (
          <div className="mt-6 grid grid-cols-4 gap-2">
            {properties.map((property, index) => (
              <div 
                key={property.id}
                className={`py-1 px-2 rounded-full text-xs font-medium text-center ${
                  index === currentPropertyIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : index < currentPropertyIndex 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                #{index + 1}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProcessingModal;
