
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyHeatmapProps {
  className?: string;
}

const PropertyHeatmap: React.FC<PropertyHeatmapProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // In a real implementation, you would use Google Maps API
  // For now, we'll create a placeholder map visualization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Map className="h-4 w-4" /> Property Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm">Loading map data...</p>
            </div>
          </div>
        ) : (
          <div className="relative h-64 bg-muted/30 rounded-md overflow-hidden">
            {/* Placeholder for Google Maps */}
            <div className="absolute inset-0 bg-slate-200">
              <div className="grid grid-cols-10 grid-rows-8 h-full w-full">
                {Array.from({length: 80}).map((_, i) => (
                  <div 
                    key={i} 
                    className="border border-slate-300"
                    style={{
                      backgroundColor: Math.random() > 0.7 
                        ? `rgba(155, 135, 245, ${Math.random() * 0.8 + 0.2})` 
                        : 'transparent'
                    }}
                  />
                ))}
              </div>
              
              {/* Sample pins */}
              <div className="absolute top-1/4 left-1/3 text-primary">
                <MapPin className="h-5 w-5 animate-pulse" />
              </div>
              <div className="absolute top-2/3 left-1/2 text-primary">
                <MapPin className="h-5 w-5 animate-pulse" />
              </div>
              <div className="absolute top-1/2 left-2/3 text-primary">
                <MapPin className="h-5 w-5 animate-pulse" />
              </div>
            </div>
            
            <div className="absolute bottom-2 right-2 bg-white p-2 rounded text-xs">
              Property density visualization
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">23 active properties</span>
          <a href="#" className="text-primary hover:underline">View Full Map</a>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyHeatmap;
