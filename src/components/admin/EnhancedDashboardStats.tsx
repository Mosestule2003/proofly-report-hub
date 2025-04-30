
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, CircleDollarSign, Users, Gauge } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EnhancedDashboardStatsProps {
  totalOrders?: number;
  evaluationsInProgress?: number;
  totalRevenue?: number;
  evaluationCompletionRate?: number;
  className?: string;
}

const EnhancedDashboardStats: React.FC<EnhancedDashboardStatsProps> = ({
  totalOrders = 0,
  evaluationsInProgress = 0,
  totalRevenue = 0,
  evaluationCompletionRate = 0,
  className
}) => {
  // Ensure we have a safe number for formatting
  const formattedRevenue = typeof totalRevenue === 'number' ? 
    totalRevenue.toLocaleString() : '0';
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Key Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="overflow-hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center rounded-full">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground truncate">Orders</p>
                <h3 className="text-sm font-bold">{totalOrders}</h3>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500/10 flex items-center justify-center rounded-full">
                <Gauge className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground truncate">In Progress</p>
                <h3 className="text-sm font-bold">{evaluationsInProgress}</h3>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500/10 flex items-center justify-center rounded-full">
                <CircleDollarSign className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground truncate">Revenue</p>
                <h3 className="text-sm font-bold">${formattedRevenue}</h3>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500/10 flex items-center justify-center rounded-full">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground truncate">Clients</p>
                <h3 className="text-sm font-bold">{Math.floor(totalOrders * 0.8)}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Completion</span>
            <span className="text-xs">{evaluationCompletionRate}%</span>
          </div>
          <Progress value={evaluationCompletionRate} className="h-1 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardStats;
