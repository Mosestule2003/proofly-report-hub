
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, User, MapPin } from 'lucide-react';
import { Property } from '@/context/CartContext';
import { Evaluator } from './EvaluatorProfile';

interface PropertyMapProps {
  properties: Property[];
  currentPropertyIndex?: number; // Current property being evaluated
  currentStep: number; // 0: en route, 1: arrived, 2: evaluating, 3: completed
  evaluator?: Evaluator; // Optional evaluator info
  className?: string;
  showAllProperties?: boolean; // Whether to show all properties or just current
  interactive?: boolean; // Interactive map (for admin view)
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  currentPropertyIndex = 0,
  currentStep, 
  evaluator,
  className,
  showAllProperties = false,
  interactive = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationFrame, setAnimationFrame] = useState(0);
  
  // In a real implementation, we would use actual Google Maps API
  // For this simulation, we'll show a placeholder map with evaluator position
  useEffect(() => {
    // Simulate map loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Animate evaluator movement
  useEffect(() => {
    if (isLoading) return;
    
    // Animation frame counter to create smooth movement
    const animationInterval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 60); // 0-59 animation frames
    }, 100);
    
    return () => clearInterval(animationInterval);
  }, [isLoading]);
  
  // Determine evaluator position based on current step and animation frame
  const getEvaluatorPosition = () => {
    // Current property being evaluated
    const currentProperty = properties[currentPropertyIndex];
    if (!currentProperty) return { left: '20%', top: '80%' };
    
    // Previous property (if any)
    const prevProperty = currentPropertyIndex > 0 ? 
      properties[currentPropertyIndex - 1] : null;
    
    switch (currentStep) {
      case 0: // en route
        // If there's a previous property, animate from there to current
        if (prevProperty && currentPropertyIndex > 0) {
          // Start at previous property (bottom right) and move to current (centered)
          const progress = animationFrame / 60; // 0-1 progress
          const startLeft = '70%';
          const startTop = '70%';
          const endLeft = '50%';
          const endTop = '50%';
          
          // Linear interpolation between positions
          const left = `calc(${startLeft} + (${endLeft} - ${startLeft}) * ${progress})`;
          const top = `calc(${startTop} + (${endTop} - ${startTop}) * ${progress})`;
          return { left, top };
        }
        // First property - enter from bottom of map
        const progress = animationFrame / 60;
        const left = `calc(50% + ${Math.sin(progress * Math.PI) * 5}%)`;
        const top = `calc(90% - ${progress * 40}%)`;
        return { left, top };
        
      case 1: // arrived
        return { left: '50%', top: '50%' };
        
      case 2: // evaluating
        // Small movement around property to simulate evaluation
        const evalX = Math.sin(animationFrame * 0.1) * 5;
        const evalY = Math.cos(animationFrame * 0.1) * 5;
        return { left: `calc(50% + ${evalX}%)`, top: `calc(50% + ${evalY}%)` };
        
      case 3: // completed
        return { left: '50%', top: '50%' };
        
      default:
        return { left: '20%', top: '80%' };
    }
  };
  
  const evaluatorPosition = getEvaluatorPosition();
  
  // Calculate positions for all properties in a grid-like layout
  const getPropertyPosition = (index: number) => {
    // Create a grid of positions
    const cols = Math.min(3, properties.length);
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // Distribute properties across the map
    const left = 30 + (col * 20); // 30%, 50%, 70%
    const top = 30 + (row * 20);  // 30%, 50%, 70% etc.
    
    return { left: `${left}%`, top: `${top}%` };
  };
  
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
              
              {/* Add some grid lines for better visualization */}
              <div className="w-3/4 h-1 bg-muted-foreground/50 rounded-full transform rotate-45"></div>
              <div className="w-3/4 h-1 bg-muted-foreground/50 rounded-full transform -rotate-45"></div>
            </div>
            
            {/* Show all properties or just current one */}
            {showAllProperties ? (
              // Show all properties
              properties.map((property, index) => (
                <div 
                  key={property.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500`}
                  style={getPropertyPosition(index)}
                >
                  <div className={`h-4 w-4 rounded-full ${
                    index < currentPropertyIndex ? 'bg-green-500' : 
                    index === currentPropertyIndex ? 'bg-blue-500 ring-4 ring-blue-200' : 
                    'bg-gray-400'
                  }`}></div>
                  {index === currentPropertyIndex && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-background px-2 py-0.5 rounded text-xs font-medium shadow-sm whitespace-nowrap">
                      Current
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Show only current property
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-200"></div>
              </div>
            )}
            
            {/* Evaluator position marker */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10"
              style={{ left: evaluatorPosition.left, top: evaluatorPosition.top }}
            >
              <div className={`h-5 w-5 rounded-full bg-primary ring-4 ring-primary/20 ${
                currentStep === 2 ? 'animate-pulse' : ''
              }`}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background px-2 py-1 rounded text-xs font-medium shadow-sm whitespace-nowrap flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Evaluator</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Property address */}
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded text-xs">
            <p className="font-medium truncate">
              {properties[currentPropertyIndex]?.address || "No property selected"}
            </p>
            {currentStep === 2 && (
              <p className="text-xs text-primary animate-pulse mt-1">
                Currently evaluating...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyMap;
