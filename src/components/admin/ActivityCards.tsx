
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Wrench } from 'lucide-react';
import { Order } from '@/services/api';

interface ActivityCardsProps {
  completedOrders: Order[];
  className?: string; // Added className prop
}

export const ActivityCards: React.FC<ActivityCardsProps> = ({ completedOrders, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Last Transactions</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">See All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedOrders.slice(0, 3).map((order) => (
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
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Maintenance Requests</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">See All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Plumbing | 721 Meadowview</p>
                  <p className="text-xs text-muted-foreground">Request ID: MS-001</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Issue</p>
                  <p className="text-sm">Broken Garbage</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Electrical | 721 Meadowview</p>
                  <p className="text-xs text-muted-foreground">Request ID: MS-002</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Issue</p>
                  <p className="text-sm">No Heat Bathroom</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/44.jpg" />
                  <AvatarFallback>AF</AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">HVAC | 721 Meadowview</p>
                  <p className="text-xs text-muted-foreground">Request ID: MS-003</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Issue</p>
                  <p className="text-sm">Non Functional Fan</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/55.jpg" />
                  <AvatarFallback>RF</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Also add a default export for backward compatibility if needed
export default ActivityCards;
