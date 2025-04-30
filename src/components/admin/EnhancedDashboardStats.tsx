
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
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <h2 className="text-2xl font-bold">{totalOrders}</h2>
              <p className="text-xs text-green-600">↑ 12% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-500/10 flex items-center justify-center rounded-full">
              <Gauge className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <h2 className="text-2xl font-bold">{evaluationsInProgress}</h2>
              <Progress value={evaluationCompletionRate} className="h-1 w-20 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center rounded-full">
              <CircleDollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h2 className="text-2xl font-bold">${formattedRevenue}</h2>
              <p className="text-xs text-green-600">↑ 8% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clients</p>
              <h2 className="text-2xl font-bold">{Math.floor(totalOrders * 0.8)}</h2>
              <p className="text-xs text-green-600">↑ 5% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboardStats;
