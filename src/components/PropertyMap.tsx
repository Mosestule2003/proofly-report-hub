
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Property } from '@/context/CartContext';

interface PropertyMapProps {
  property: Property;
  currentStep: number; // 0: en route, 1: arrived, 2: evaluating, 3: completed
  className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ property, currentStep, className }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // In a real implementation, we would use actual Google Maps API
  // For this simulation, we'll just show a placeholder map with evaluator position
  useEffect(() => {
    // Simulate map loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Determine evaluator position based on current step
  // In a real implementation, we'd use actual coordinates
  const getEvaluatorPosition = () => {
    switch (currentStep) {
      case 0: // en route
        return { left: '30%', top: '70%' };
      case 1: // arrived
      case 2: // evaluating
      case 3: // completed
        return { left: '50%', top: '50%' };
      default:
        return { left: '20%', top: '80%' };
    }
  };
  
  const evaluatorPosition = getEvaluatorPosition();
  
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className || 'h-64'}`}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Simple map visualization (in a real implementation, this would be Google Maps) */}
          <div className="absolute inset-0 bg-muted-foreground/10">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-3/4 h-1 bg-muted-foreground rounded-full"></div>
              <div className="h-3/4 w-1 bg-muted-foreground rounded-full"></div>
            </div>
            
            {/* Property location marker */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-200"></div>
            </div>
            
            {/* Evaluator position marker */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
              style={{ left: evaluatorPosition.left, top: evaluatorPosition.top }}
            >
              <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-background px-2 py-0.5 rounded text-xs font-medium shadow-sm whitespace-nowrap">
                  Evaluator
                </div>
              </div>
            </div>
          </div>
          
          {/* Property address */}
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded text-xs">
            <p className="font-medium truncate">{property.address}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyMap;
