
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle2, 
  Clock, 
  Star,
  BarChart,
  TrendingUp,
  User
} from 'lucide-react';

interface Order {
  id: string;
  status?: string;
  rating?: number;
  tenantName?: string;
  userId?: string;
  date?: string;
}

interface ActivityCardsProps {
  completedOrders: Order[];
}

const ActivityCards: React.FC<ActivityCardsProps> = ({ completedOrders = [] }) => {
  // Ensure we have valid data to display
  const safeOrders = completedOrders || [];
  
  // Calculate average rating safely
  const validRatings = safeOrders.filter(order => order.rating !== undefined);
  const avgRating = validRatings.length > 0 
    ? validRatings.reduce((sum, order) => sum + (order.rating || 0), 0) / validRatings.length 
    : 0;
  
  // Get recent completions (last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const recentCompletions = safeOrders.filter(order => {
    if (!order.date) return false;
    const orderDate = new Date(order.date);
    return orderDate >= oneDayAgo;
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
            Recent Completions
          </CardTitle>
          <CardDescription>Completed evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentCompletions.length}</div>
          <p className="text-xs text-muted-foreground">
            in the last 24 hours
          </p>
          <div className="mt-4 space-y-2">
            {safeOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={`https://avatar.vercel.sh/${order.tenantName || 'user'}`} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[150px]">{order.tenantName || 'Unknown User'}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Completed
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Star className="mr-2 h-4 w-4 text-amber-500" />
            Service Rating
          </CardTitle>
          <CardDescription>Average customer rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRating.toFixed(1)}/5.0</div>
          <p className="text-xs text-muted-foreground">
            based on {validRatings.length} ratings
          </p>
          <div className="mt-4 flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-5 w-5 ${star <= Math.round(avgRating) 
                  ? 'text-amber-500 fill-amber-500' 
                  : 'text-muted-foreground'}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
            Completion Rate
          </CardTitle>
          <CardDescription>Service efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">98%</div>
          <p className="text-xs text-muted-foreground">
            evaluations completed on time
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Average completion: 2.3 days
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Fastest turnaround: 14 hours
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityCards;
