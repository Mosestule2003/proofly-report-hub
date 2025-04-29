
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'evaluation_complete' | 'outreach_success' | 'booking_confirmed' | 'system_alert';
  message: string;
  timestamp: string;
  read: boolean;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ 
  activities,
  className 
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'evaluation_complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'outreach_success':
        return <Activity className="h-5 w-5 text-primary" />;
      case 'booking_confirmed':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'system_alert':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li 
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-md",
                    activity.read ? "opacity-70" : "bg-muted/30"
                  )}
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="text-center">
            <a href="#" className="text-xs text-primary hover:underline">View All Activity</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
