
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order } from '@/services/api';

interface ActivityCardsProps {
  completedOrders: Order[];
}

const ActivityCards: React.FC<ActivityCardsProps> = ({ completedOrders }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Last Transactions</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7">See All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {completedOrders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}`} 
                    alt="Property" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa";
                    }} 
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {order.properties[0].address.split(',')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.createdAt), "d MMM yyyy, h:mm a")}
                  </p>
                </div>
              </div>
              <p className="font-semibold">${order.totalPrice}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCards;
