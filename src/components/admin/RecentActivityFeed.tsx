
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, AlertCircle, Clock, Calendar, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { api } from '@/services/api';
import { useNotificationsContext } from '@/context/NotificationsContext';

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
  activities: initialActivities,
  className 
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const { notifications } = useNotificationsContext();
  
  useEffect(() => {
    // Combine initial activities with any new ones
    setActivities(initialActivities);
    
    // Listen for real-time user events and activities
    const unsubscribe = api.subscribeToUserUpdates((data) => {
      if (data.type === 'USER_CREATED') {
        const newActivity: ActivityItem = {
          id: `user-${Date.now()}`,
          type: 'user_registered',
          message: `New user registered: ${data.user?.name || 'Unknown'}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: data.user?.id,
          userName: data.user?.name
        };
        
        setActivities(prev => [newActivity, ...prev]);
        
        // Also create a notification
        notifications.addNotification(
          'New User Registration', 
          `${data.user?.name || 'Someone new'} just created an account!`,
          { type: 'info', showToast: true }
        );
      }
      
      if (data.type === 'USER_UPDATED') {
        const newActivity: ActivityItem = {
          id: `user-update-${Date.now()}`,
          type: 'user_login',
          message: `User profile updated: ${data.user?.name || 'Unknown'}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: data.user?.id,
          userName: data.user?.name
        };
        
        setActivities(prev => [newActivity, ...prev]);
      }
    });
    
    // Listen for order related events
    const unsubscribeOrders = api.subscribeToOrderUpdates((data) => {
      if (data.type === 'ORDER_CREATED') {
        const newActivity: ActivityItem = {
          id: `order-${Date.now()}`,
          type: 'booking_confirmed',
          message: `New order placed${data.order?.userId ? ` by ${data.order.userId}` : ''}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: data.order?.userId
        };
        
        setActivities(prev => [newActivity, ...prev]);
        
        // Create notification
        notifications.addNotification(
          'New Order Placed', 
          `A new property evaluation order has been placed${data.order?.userId ? ` by ${data.order.userId}` : ''}`,
          { type: 'success', showToast: true }
        );
      }
      
      if (data.type === 'ORDER_UPDATED' && data.order?.status === 'Report Ready') {
        const newActivity: ActivityItem = {
          id: `order-complete-${Date.now()}`,
          type: 'evaluation_complete',
          message: `Evaluation completed${data.order?.userId ? ` for ${data.order.userId}` : ''}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: data.order?.userId
        };
        
        setActivities(prev => [newActivity, ...prev]);
      }
    });
    
    return () => {
      unsubscribe();
      unsubscribeOrders();
    };
  }, [initialActivities, notifications]);

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

  const handleActivityClick = (activity: ActivityItem) => {
    // Navigate to appropriate detail page based on activity type
    if (activity.userId && (activity.type === 'user_registered' || activity.type === 'user_login')) {
      window.location.href = `/admin/users/${activity.userId}`;
    } else if (activity.id.includes('order')) {
      // Extract order ID if available and navigate to order details
      const orderId = activity.id.replace('order-', '').replace('order-complete-', '');
      if (!isNaN(Number(orderId))) {
        window.location.href = `/admin/orders/${orderId}`;
      }
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
                    "flex items-start gap-2 p-2 rounded-md cursor-pointer",
                    activity.read ? "opacity-70" : "bg-muted/30",
                    "hover:bg-muted transition-colors"
                  )}
                  onClick={() => handleActivityClick(activity)}
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
          <a href="/admin/activity" className="text-xs text-primary hover:underline">View All</a>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
