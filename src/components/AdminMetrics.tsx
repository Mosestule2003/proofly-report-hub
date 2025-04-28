
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Tenants</CardDescription>
          <CardTitle className="text-3xl">{tenantCount}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">Active Users</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="text-3xl">{orderCount}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <ClipboardList className="h-4 w-4 mr-1" />
            <span className="text-sm">All Time</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Pending Orders</CardDescription>
          <CardTitle className="text-3xl">{pendingOrderCount}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">Awaiting Action</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Completed Orders</CardDescription>
          <CardTitle className="text-3xl">{completedOrderCount}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <Building className="h-4 w-4 mr-1" />
            <span className="text-sm">Evaluations Complete</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMetrics;
