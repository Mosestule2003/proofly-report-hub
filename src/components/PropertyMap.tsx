import React, { useEffect, useRef, useState } from 'react';
import { Loader2, User, MapPin, Route, Navigation, MapPinCheck } from 'lucide-react';
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
  showAllProperties = true, // Changed default to true
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
    
    // Get positions for current property
    const currentPos = getPropertyPosition(currentPropertyIndex);
    const currentPosLeft = parseInt(currentPos.left);
    const currentPosTop = parseInt(currentPos.top);
    
    switch (currentStep) {
      case 0: // en route
        // If there's a previous property, animate from there to current
        if (prevProperty && currentPropertyIndex > 0) {
          // Get position for previous property
          const prevPos = getPropertyPosition(currentPropertyIndex - 1);
          const prevPosLeft = parseInt(prevPos.left);
          const prevPosTop = parseInt(prevPos.top);
          
          // Progress from 0 to 1 based on animation frame
          const progress = animationFrame / 60;
          
          // Linear interpolation between positions
          const left = prevPosLeft + (currentPosLeft - prevPosLeft) * progress;
          const top = prevPosTop + (currentPosTop - prevPosTop) * progress;
          
          // Add a slight wave to the movement
          const offsetX = Math.sin(progress * Math.PI * 2) * 3;
          const offsetY = Math.cos(progress * Math.PI * 2) * 3;
          
          return { left: `${left + offsetX}%`, top: `${top + offsetY}%` };
        }
        
        // First property - enter from bottom of map
        const progress = animationFrame / 60;
        const left = 50 + Math.sin(progress * Math.PI) * 5;
        const top = 90 - progress * 40;
        return { left: `${left}%`, top: `${top}%` };
        
      case 1: // arrived
        return { left: `${currentPosLeft}%`, top: `${currentPosTop}%` };
        
      case 2: // evaluating
        // Small movement around property to simulate evaluation
        const evalX = Math.sin(animationFrame * 0.2) * 3;
        const evalY = Math.cos(animationFrame * 0.2) * 3;
        return { 
          left: `${currentPosLeft + evalX}%`, 
          top: `${currentPosTop + evalY}%` 
        };
        
      case 3: // completed
        return { left: `${currentPosLeft}%`, top: `${currentPosTop}%` };
        
      default:
        return { left: '20%', top: '80%' };
    }
  };
  
  const evaluatorPosition = getEvaluatorPosition();
  
  // Calculate positions for all properties in a grid-like layout
  const getPropertyPosition = (index: number) => {
    // Create a more natural distribution of property positions
    // For a more realistic map appearance
    const positions = [
      { left: '30', top: '40' }, // Property 1
      { left: '60', top: '30' }, // Property 2
      { left: '70', top: '60' }, // Property 3
      { left: '40', top: '70' }, // Property 4
      { left: '20', top: '50' }, // Property 5
      { left: '50', top: '20' }, // Property 6
      { left: '80', top: '40' }, // Property 7
      { left: '35', top: '30' }, // Property 8
    ];
    
    // If we have predefined positions for this index, use it
    if (index < positions.length) {
      return positions[index];
    }
    
    // Otherwise fall back to grid calculation
    const cols = Math.min(3, properties.length);
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // Distribute properties across the map
    const left = 30 + (col * 20); // 30%, 50%, 70%
    const top = 30 + (row * 20);  // 30%, 50%, 70% etc.
    
    return { left: `${left}`, top: `${top}` };
  };
  
  // Get appropriate icon for property based on status
  const getPropertyIcon = (index: number) => {
    if (index < currentPropertyIndex) {
      return <MapPinCheck className="h-4 w-4 text-green-500" />;
    } else if (index === currentPropertyIndex) {
      return <MapPin className="h-4 w-4 text-blue-500" />;
    } else {
      return <MapPin className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getStepLabel = () => {
    switch (currentStep) {
      case 0: return "En Route";
      case 1: return "Arrived";
      case 2: return "Evaluating";
      case 3: return "Completed";
      default: return "";
    }
  };
  
  // Draw a path line between properties
  const renderPathLines = () => {
    if (!showAllProperties || properties.length <= 1) return null;
    
    const lines = [];
    
    // Draw lines between sequential properties
    for (let i = 0; i < properties.length - 1; i++) {
      const startPos = getPropertyPosition(i);
      const endPos = getPropertyPosition(i + 1);
      
      const startLeft = parseInt(startPos.left);
      const startTop = parseInt(startPos.top);
      const endLeft = parseInt(endPos.left);
      const endTop = parseInt(endPos.top);
      
      // Different styling for completed path segments vs upcoming ones
      const isCompleted = i < currentPropertyIndex;
      
      lines.push(
        <div 
          key={`path-${i}`}
          className={`absolute h-0.5 ${
            isCompleted ? 'bg-green-500' : 'bg-gray-300'
          } transform-gpu z-0`}
          style={{
            left: `${startLeft}%`,
            top: `${startTop}%`,
            width: `${Math.sqrt(Math.pow(endLeft - startLeft, 2) + Math.pow(endTop - startTop, 2))}%`,
            transformOrigin: 'left center',
            transform: `rotate(${Math.atan2(endTop - startTop, endLeft - startLeft) * (180 / Math.PI)}deg)`,
          }}
        />
      );
      
      // Add route marker icons along the path
      if (showAllProperties && i < currentPropertyIndex) {
        const midLeft = startLeft + (endLeft - startLeft) * 0.5;
        const midTop = startTop + (endTop - startTop) * 0.5;
        
        lines.push(
          <div 
            key={`route-marker-${i}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-5"
            style={{ left: `${midLeft}%`, top: `${midTop}%` }}
          >
            <Route className="h-3 w-3 text-green-500" />
          </div>
        );
      }
    }
    
    return lines;
  };
  
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className || 'h-64'}`}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Simple map visualization */}
          <div className="absolute inset-0 bg-muted-foreground/10">
            {/* Map grid background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-3/4 h-1 bg-muted-foreground rounded-full"></div>
              <div className="h-3/4 w-1 bg-muted-foreground rounded-full"></div>
              
              {/* Add some grid lines for better visualization */}
              <div className="w-3/4 h-1 bg-muted-foreground/50 rounded-full transform rotate-45"></div>
              <div className="w-3/4 h-1 bg-muted-foreground/50 rounded-full transform -rotate-45"></div>
            </div>
            
            {/* Render path lines between properties */}
            {renderPathLines()}
            
            {/* Show all properties or just current one */}
            {showAllProperties ? (
              // Show all properties
              properties.map((property, index) => (
                <div 
                  key={property.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-10`}
                  style={{
                    left: `${getPropertyPosition(index).left}%`, 
                    top: `${getPropertyPosition(index).top}%`,
                  }}
                >
                  <div className={`flex flex-col items-center`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      index < currentPropertyIndex ? 'bg-green-500/20' : 
                      index === currentPropertyIndex ? 'bg-blue-500/20 ring-4 ring-blue-200' : 
                      'bg-gray-400/20'
                    }`}>
                      {getPropertyIcon(index)}
                    </div>
                    
                    <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-medium shadow-sm whitespace-nowrap ${
                      index < currentPropertyIndex ? 'bg-green-100 text-green-800' : 
                      index === currentPropertyIndex ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Current property indicator */}
                  {index === currentPropertyIndex && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 px-2 py-0.5 rounded text-xs font-medium text-white shadow-sm whitespace-nowrap">
                      {getStepLabel()}
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20"
              style={{ left: evaluatorPosition.left, top: evaluatorPosition.top }}
            >
              <div className={`h-8 w-8 rounded-full bg-primary flex items-center justify-center ${
                currentStep === 2 ? 'animate-pulse' : ''
              }`}>
                <Navigation className="h-5 w-5 text-white" />
                
                {/* Evaluator info bubble */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-xs font-medium shadow-sm whitespace-nowrap flex items-center gap-1 border">
                  <User className="h-3 w-3" />
                  <span>{evaluator?.name || "Evaluator"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Property address */}
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded text-xs">
            <div className="flex justify-between items-center">
              <p className="font-medium truncate">
                {properties[currentPropertyIndex]?.address || "No property selected"}
              </p>
              
              {currentStep !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  currentStep === 0 ? 'bg-amber-100 text-amber-800' : 
                  currentStep === 1 ? 'bg-blue-100 text-blue-800' : 
                  currentStep === 2 ? 'bg-purple-100 text-purple-800 animate-pulse' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {getStepLabel()}
                </span>
              )}
            </div>
            
            {/* Progress indicators */}
            <div className="mt-2 flex justify-between items-center">
              <div className="flex space-x-1">
                {['En Route', 'Arrived', 'Evaluating', 'Completed'].map((stepLabel, idx) => (
                  <div 
                    key={stepLabel} 
                    className={`h-1.5 w-6 rounded-full ${
                      idx < currentStep ? 'bg-green-500' :
                      idx === currentStep ? 'bg-primary' : 
                      'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              
              {/* Property count */}
              <div className="text-[10px] text-muted-foreground">
                Property {currentPropertyIndex + 1} of {properties.length}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyMap;
