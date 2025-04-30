
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Users, CheckCircle } from 'lucide-react';

interface AIOutreachStatsProps {
  totalOutreach?: number;
  successRate?: number;
  responsesReceived?: number;
  className?: string;
}

export const AIOutreachStats: React.FC<AIOutreachStatsProps> = ({
  totalOutreach = 68,
  successRate = 87,
  responsesReceived = 59,
  className = ''
}) => {
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> AI Outreach Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">Outreach Success Rate</p>
              <span className="text-sm font-medium">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-3 rounded-md flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Outreach</p>
                <p className="text-lg font-medium">{totalOutreach}</p>
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Responses Received</p>
                <p className="text-lg font-medium">{responsesReceived}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              AI-powered outreach has connected tenants with {successRate}% of landlords, 
              significantly reducing scheduling time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIOutreachStats;
