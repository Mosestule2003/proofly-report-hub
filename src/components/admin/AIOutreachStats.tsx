
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

export const AIOutreachStats: React.FC<AIOutreachStatsProps> = ({
  successRate = 78,
  totalOutreaches = 142,
  scheduledViewings = 37,
  avgResponseTime = "2.4m"
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          AI Outreach Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-sm font-medium">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-2 mt-1" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <Phone className="h-5 w-5 text-primary mb-1" />
              <span className="text-xl font-semibold">{totalOutreaches}</span>
              <span className="text-xs text-muted-foreground">Total Calls</span>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <CalendarCheck className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-xl font-semibold">{scheduledViewings}</span>
              <span className="text-xs text-muted-foreground">Scheduled</span>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500 mb-1" />
              <span className="text-xl font-semibold">{avgResponseTime}</span>
              <span className="text-xs text-muted-foreground">Avg. Response</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <CircleCheck className="h-4 w-4 text-green-500 mr-1" />
              <span>Last outreach: 12 minutes ago</span>
            </div>
            <a href="#" className="text-primary hover:underline">View Details</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
