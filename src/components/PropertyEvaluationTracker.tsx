
import React, { useState, useEffect } from 'react';
import { Building, CheckCircle, MapPin, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Property } from '@/context/CartContext';
import { Order, OrderStepStatus } from '@/services/api';
import PropertyMap from './PropertyMap';
import EvaluatorProfile from './EvaluatorProfile';

interface PropertyEvaluationTrackerProps {
  order: Order;
}

const PropertyEvaluationTracker: React.FC<PropertyEvaluationTrackerProps> = ({ order }) => {
  const [progressValue, setProgressValue] = useState(0);

  // Calculate which step of the process we're on (as a percentage)
  useEffect(() => {
    const calculateProgress = () => {
      if (!order || !order.currentStep) return 0;
      
      const steps: OrderStepStatus[] = ['PENDING_MATCH', 'EN_ROUTE', 'ARRIVED', 'EVALUATING', 'COMPLETED', 'REPORT_READY'];
      const currentStepIndex = steps.indexOf(order.currentStep);
      const totalSteps = steps.length - 1; // -1 because we don't count PENDING_MATCH in the progress
      
      let propertyProgress = 0;
      if (order.currentPropertyIndex !== undefined && order.properties.length > 0) {
        // Calculate progress within the properties (each property is an equal portion of progress)
        const propertyFraction = 1 / order.properties.length;
        const completedProperties = order.currentPropertyIndex;
        const basePropertyProgress = completedProperties * propertyFraction;
        
        // If we're in the middle of evaluating a property, add partial property progress
        if (currentStepIndex > 1 && currentStepIndex < 5) { // Between EN_ROUTE and COMPLETED
          const propertySteps = 4; // EN_ROUTE, ARRIVED, EVALUATING, COMPLETED
          const propertyStepIndex = currentStepIndex - 1; // -1 because EN_ROUTE is the first property step
          const propertyStepProgress = (propertyStepIndex / propertySteps) * propertyFraction;
          propertyProgress = basePropertyProgress + propertyStepProgress;
        } else {
          propertyProgress = basePropertyProgress;
        }
      }
      
      let progress = 0;
      if (order.currentStep === 'PENDING_MATCH') {
        progress = 5; // Starting progress
      } else if (order.currentStep === 'REPORT_READY') {
        progress = 100; // Done
      } else {
        progress = 10 + (propertyProgress * 85); // Scale to 10-95% range
      }
      
      return Math.min(progress, 100);
    };

    // Animate progress bar
    const targetProgress = calculateProgress();
    const timer = setInterval(() => {
      setProgressValue(current => {
        if (current >= targetProgress) {
          clearInterval(timer);
          return current;
        }
        return Math.min(current + 0.5, targetProgress);
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, [order]);

  // Get the map step number (0: en route, 1: arrived, 2: evaluating, 3: completed)
  const getMapStepNumber = (orderStep: OrderStepStatus | undefined): number => {
    if (!orderStep) return 0;
    
    switch (orderStep) {
      case 'EN_ROUTE': return 0;
      case 'ARRIVED': return 1;
      case 'EVALUATING': return 2;
      case 'COMPLETED': 
      case 'REPORT_READY': 
        return 3;
      default: return 0;
    }
  };
  
  // Get message based on current step
  const getStepMessage = (): string => {
    if (!order.currentStep) return 'Processing...';
    
    const currentPropertyIndex = order.currentPropertyIndex || 0;
    const property = order.properties[currentPropertyIndex];
    const address = property ? property.address.split(',')[0] : '';
    
    switch (order.currentStep) {
      case 'PENDING_MATCH':
        return 'Finding an evaluator near you...';
      case 'EN_ROUTE':
        return `Evaluator en route to ${address}...`;
      case 'ARRIVED':
        return `Evaluator has arrived at ${address}...`;
      case 'EVALUATING':
        return `Evaluating property at ${address}...`;
      case 'COMPLETED':
        return `Evaluation completed for ${address}.`;
      case 'REPORT_READY':
        return 'Your evaluation report is ready!';
      default:
        return 'Processing...';
    }
  };
  
  if (!order) return null;
  
  return (
    <div className="border border-dashed rounded-lg p-6 bg-muted/30">
      <div className="text-center mb-6">
        <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-1">Evaluation in progress</h3>
        <p className="text-sm text-muted-foreground">
          {getStepMessage()}
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-6 relative">
        <div className="h-1 bg-muted-foreground/20 rounded-full mb-2">
          <div 
            className="h-1 bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Finding Evaluator</span>
          <span>Evaluation</span>
          <span>Report Ready</span>
        </div>
      </div>
      
      {/* Show evaluator if assigned */}
      {order.evaluator && order.status !== 'Pending' && (
        <div className="mb-6">
          <h4 className="font-medium text-sm mb-2">Your Evaluator</h4>
          <EvaluatorProfile evaluator={order.evaluator} />
        </div>
      )}
      
      {/* Enhanced map for in-progress evaluations */}
      {order.currentStep && 
       order.currentStep !== 'PENDING_MATCH' && 
       order.currentStep !== 'REPORT_READY' && 
       order.currentPropertyIndex !== undefined && (
        <div className="mb-6">
          <p className="font-medium text-sm mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            Live Tracking
          </p>
          
          <PropertyMap 
            properties={order.properties}
            currentPropertyIndex={order.currentPropertyIndex}
            currentStep={getMapStepNumber(order.currentStep)}
            evaluator={order.evaluator}
            className="h-64"
            showAllProperties={true}
          />
        </div>
      )}
      
      {/* Horizontal carousel for properties */}
      <div className="mt-6">
        <h4 className="font-medium text-sm mb-3">Properties in this Order</h4>
        {order.properties.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {order.properties.map((property, index) => (
                <CarouselItem key={property.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3">
                  <Card className={`${
                    index === order.currentPropertyIndex ? 'border-primary bg-primary/5' : 
                    (order.currentPropertyIndex !== undefined && index < order.currentPropertyIndex) ? 'border-green-500' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          index === order.currentPropertyIndex ? 'bg-primary text-white' : 
                          (order.currentPropertyIndex !== undefined && index < order.currentPropertyIndex) ? 'bg-green-500 text-white' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="space-y-1 flex-grow overflow-hidden">
                          <p className="font-medium truncate">{property.address}</p>
                          {property.description && (
                            <p className="text-sm text-muted-foreground truncate">{property.description}</p>
                          )}
                          <Badge variant={index === order.currentPropertyIndex ? "default" : "outline"} className="mt-2">
                            {(order.currentPropertyIndex !== undefined && index < order.currentPropertyIndex) ? 'Completed' : 
                             index === order.currentPropertyIndex ? 
                               order.currentStep === 'EN_ROUTE' ? 'En Route' :
                               order.currentStep === 'ARRIVED' ? 'Arrived' :
                               order.currentStep === 'EVALUATING' ? 'Evaluating' :
                               order.currentStep === 'COMPLETED' ? 'Completed' : 'Pending'
                             : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No properties in this order</p>
        )}
      </div>
    </div>
  );
};

export default PropertyEvaluationTracker;
