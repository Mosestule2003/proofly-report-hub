
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyHeatmapProps {
  className?: string;
}

const PropertyHeatmap: React.FC<PropertyHeatmapProps> = ({ className }) => {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Map className="h-4 w-4" /> Property Demand Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-muted/30 rounded-md w-full h-[240px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Heatmap visualization</p>
            <p className="text-xs text-muted-foreground mt-1">
              Showing property demand across neighborhoods
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyHeatmap;
