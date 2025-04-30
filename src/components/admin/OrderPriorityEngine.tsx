
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Flag, AlertTriangle } from 'lucide-react';

interface OrderPriorityItem {
  id: string;
  orderNumber: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  reason: string;
  properties: number;
  deadline: string;
}

interface OrderPriorityEngineProps {
  orders?: OrderPriorityItem[];
  className?: string;
}

export const OrderPriorityEngine: React.FC<OrderPriorityEngineProps> = ({
  orders = [
    {
      id: 'ord-1',
      orderNumber: 'ORD-7821',
      urgencyLevel: 'high',
      reason: 'Evaluation deadline in 24 hours',
      properties: 1,
      deadline: 'Today, 5:00 PM'
    },
    {
      id: 'ord-2',
      orderNumber: 'ORD-7652',
      urgencyLevel: 'medium',
      reason: 'Multiple properties in one order',
      properties: 4,
      deadline: 'Tomorrow, 12:00 PM'
    },
    {
      id: 'ord-3',
      orderNumber: 'ORD-7544',
      urgencyLevel: 'low',
      reason: 'Standard evaluation request',
      properties: 1,
      deadline: 'May 3, 10:00 AM'
    }
  ],
  className = ''
}) => {
  const getUrgencyBadge = (level: string) => {
    switch(level) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Medium</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Low</Badge>;
    }
  };
  
  const getUrgencyIcon = (level: string) => {
    switch(level) {
      case 'high':
        return <Flag className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-green-600" />;
    }
  };
  
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Flag className="h-4 w-4" /> Order Priority Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getUrgencyIcon(order.urgencyLevel)}
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                {getUrgencyBadge(order.urgencyLevel)}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{order.reason}</p>
              <div className="flex justify-between text-xs">
                <span>
                  <span className="text-muted-foreground">Properties: </span>
                  {order.properties}
                </span>
                <span>
                  <span className="text-muted-foreground">Deadline: </span>
                  {order.deadline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderPriorityEngine;
