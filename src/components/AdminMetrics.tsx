
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, ClipboardList, Clock } from 'lucide-react';

interface AdminMetricsProps {
  tenantCount: number;
  orderCount: number;
  pendingOrderCount: number;
  completedOrderCount: number;
}

const AdminMetrics: React.FC<AdminMetricsProps> = ({
  tenantCount,
  orderCount,
  pendingOrderCount,
  completedOrderCount
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Admin Metrics</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start">
            <div className="flex items-center text-muted-foreground mb-1">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-xs truncate">Total Tenants</span>
            </div>
            <span className="font-bold">{tenantCount}</span>
          </div>
          
          <div className="flex flex-col items-start">
            <div className="flex items-center text-muted-foreground mb-1">
              <ClipboardList className="h-4 w-4 mr-1" />
              <span className="text-xs truncate">Total Orders</span>
            </div>
            <span className="font-bold">{orderCount}</span>
          </div>
          
          <div className="flex flex-col items-start">
            <div className="flex items-center text-muted-foreground mb-1">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-xs truncate">Pending</span>
            </div>
            <span className="font-bold">{pendingOrderCount}</span>
          </div>
          
          <div className="flex flex-col items-start">
            <div className="flex items-center text-muted-foreground mb-1">
              <Building className="h-4 w-4 mr-1" />
              <span className="text-xs truncate">Completed</span>
            </div>
            <span className="font-bold">{completedOrderCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminMetrics;
