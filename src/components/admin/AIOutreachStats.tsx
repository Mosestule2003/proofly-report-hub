
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck, Phone, Clock, CalendarCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AIOutreachStatsProps {
  successRate?: number;
  totalOutreaches?: number;
  scheduledViewings?: number;
  avgResponseTime?: string;
}

const AIOutreachStats: React.FC<AIOutreachStatsProps> = ({
  successRate = 78,
  totalOutreaches = 124,
  scheduledViewings = 42,
  avgResponseTime = "2.4h"
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">AI Outreach</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Success Rate</span>
              <span className="text-xs">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-1 mt-1" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
              <Phone className="h-3 w-3 text-primary mb-1" />
              <span className="text-sm font-semibold">{totalOutreaches}</span>
              <span className="text-xs text-muted-foreground truncate">Calls</span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
              <CalendarCheck className="h-3 w-3 text-green-500 mb-1" />
              <span className="text-sm font-semibold">{scheduledViewings}</span>
              <span className="text-xs text-muted-foreground truncate">Scheduled</span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
              <Clock className="h-3 w-3 text-amber-500 mb-1" />
              <span className="text-sm font-semibold">{avgResponseTime}</span>
              <span className="text-xs text-muted-foreground truncate">Response</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CircleCheck className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs truncate">Last: 12m ago</span>
            </div>
            <a href="#" className="text-xs text-primary hover:underline">Details</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIOutreachStats;
