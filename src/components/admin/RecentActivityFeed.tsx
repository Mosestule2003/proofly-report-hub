
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, AlertCircle, Clock, Calendar, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface ActivityItem {
  id: string;
  type: 'evaluation_complete' | 'outreach_success' | 'booking_confirmed' | 'system_alert' | 'user_registered' | 'user_login';
  message: string;
  timestamp: string;
  read: boolean;
  userId?: string;
  userName?: string;
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'outreach_success':
        return <Activity className="h-4 w-4 text-primary" />;
      case 'booking_confirmed':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'user_registered':
      case 'user_login':
        return <UserCircle2 className="h-4 w-4 text-indigo-500" />;
      case 'system_alert':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatTimestamp = (timestamp: string): string => {
    if (timestamp.includes('ago')) return timestamp; // Already formatted
    
    try {
      const date = new Date(timestamp);
      return format(date, 'MMM d, h:mm a');
    } catch (e) {
      return timestamp;
    }
  };
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" /> Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto p-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm p-2">No recent activity</p>
          ) : (
            <ul className="space-y-2">
              {activities.slice(0, 5).map((activity) => (
                <li 
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-md",
                    activity.read ? "opacity-70" : "bg-muted/30"
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs line-clamp-1">{activity.message}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatTimestamp(activity.timestamp)}
                      {activity.userName && ` • ${activity.userName.substring(0, 10)}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-center border-t py-2">
          <a href="#" className="text-xs text-primary hover:underline">View All</a>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
