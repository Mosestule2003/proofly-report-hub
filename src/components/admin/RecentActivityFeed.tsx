
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, AlertCircle, Clock, Calendar, UserCircle2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { api } from '@/services/api';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { toast } from 'sonner';

export interface ActivityItem {
  id: string;
  type: 'evaluation_complete' | 'outreach_success' | 'booking_confirmed' | 'system_alert' | 'user_registered' | 'user_login' | 'user_inquiry';
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
      if (data.type === 'USER_CREATED' || data.type === 'USERS_UPDATED' && data.newUser) {
        const user = data.user || data.newUser;
        if (!user) return;
        
        const newActivity: ActivityItem = {
          id: `user-${Date.now()}`,
          type: 'user_registered',
          message: `New user registered: ${user.name || 'Unknown'}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: user.id,
          userName: user.name
        };
        
        setActivities(prev => [newActivity, ...prev]);
        
        // Create a notification for new user registrations (important)
        notifications.addNotification(
          'New User Registration', 
          `${user.name || 'Someone new'} just created an account!`,
          { type: 'info', showToast: true, actionUrl: `/admin/users/${user.id}` }
        );
      }
      
      if (data.type === 'USER_UPDATED') {
        // Only add activity - no notification for user updates to reduce spam
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
    
    // For order related events, use adminUpdates subscription instead
    const unsubscribeAdmin = api.subscribeToAdminUpdates((data) => {
      if (data.type === 'ORDER_CREATED') {
        const newActivity: ActivityItem = {
          id: `order-${Date.now()}`,
          type: 'booking_confirmed',
          message: `New order placed${data.order?.userId ? ` by user ${data.order.userId}` : ''}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: data.order?.userId
        };
        
        setActivities(prev => [newActivity, ...prev]);
        
        // Create notification for new orders (important business event)
        notifications.addNotification(
          'New Order Placed', 
          `A new property evaluation order has been placed${data.order?.properties ? ` for ${data.order.properties.length} properties` : ''}`,
          { 
            type: 'success', 
            showToast: true,
            actionUrl: data.order ? `/admin/orders/${data.order.id}` : '/admin/orders'
          }
        );
      }
      
      if (data.type === 'ORDER_UPDATED' && data.status === 'Report Ready') {
        const newActivity: ActivityItem = {
          id: `order-complete-${Date.now()}`,
          type: 'evaluation_complete',
          message: `Evaluation completed for order ${data.orderId?.substring(0, 8) || 'Unknown'}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: data.order?.userId
        };
        
        setActivities(prev => [newActivity, ...prev]);
        
        // Report ready notifications (important for both admin and customer)
        notifications.addNotification(
          'Evaluation Complete', 
          `Order #${data.orderId?.substring(0, 8) || 'Unknown'} evaluation has been completed`,
          {
            type: 'success',
            showToast: true,
            actionUrl: data.orderId ? `/admin/orders/${data.orderId}` : '/admin/orders'
          }
        );
      }
      
      if (data.type === 'REPORT_CREATED') {
        // Only add activity - no notification for report creation to reduce spam
        // (we already notify on 'report ready' status)
        const newActivity: ActivityItem = {
          id: `report-${Date.now()}`,
          type: 'evaluation_complete',
          message: `New report generated for order ${data.report?.orderId?.substring(0, 8) || 'Unknown'}`,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setActivities(prev => [newActivity, ...prev]);
      }
    });
    
    // Create user inquiry handler with reduced frequency (once every 20-30 minutes instead of 5-10)
    const simulateUserInquiry = () => {
      // Simulate a random user inquiry every 20-30 minutes (reduced frequency)
      const randomTime = Math.floor(Math.random() * (1800000 - 1200000) + 1200000);
      
      setTimeout(() => {
        // Only create inquiry if we have activities (to avoid spam in empty systems)
        // and only 30% chance of creating an inquiry (to further reduce frequency)
        if (activities.length > 0 && Math.random() < 0.3) {
          const inquiryTypes = [
            'pricing question',
            'evaluation process',
            'billing support',
            'technical issue',
            'service availability'
          ];
          
          const randomInquiryType = inquiryTypes[Math.floor(Math.random() * inquiryTypes.length)];
          
          // Get a random user from existing activities
          const usersInActivities = activities
            .filter(a => a.userName && a.userId)
            .map(a => ({ name: a.userName!, id: a.userId! }));
          
          if (usersInActivities.length > 0) {
            const randomUser = usersInActivities[Math.floor(Math.random() * usersInActivities.length)];
            
            const newActivity: ActivityItem = {
              id: `inquiry-${Date.now()}`,
              type: 'user_inquiry',
              message: `User inquiry from ${randomUser.name}: ${randomInquiryType}`,
              timestamp: new Date().toISOString(),
              read: false,
              userId: randomUser.id,
              userName: randomUser.name
            };
            
            setActivities(prev => [newActivity, ...prev]);
            
            // User inquiries are important - notify admins
            notifications.addNotification(
              'New User Inquiry', 
              `${randomUser.name} has a question about ${randomInquiryType}`,
              { 
                type: 'info', 
                showToast: false, // Don't show toast for every inquiry
                actionUrl: `/admin/users/${randomUser.id}`
              }
            );
            
            // Display toast but less frequently
            if (Math.random() < 0.5) {
              toast.info(`New user inquiry received from ${randomUser.name}`);
            }
          }
        }
        
        // Schedule next inquiry
        simulateUserInquiry();
      }, randomTime);
    };
    
    // Start the simulation (for demo purposes only), but with longer delay
    const inquiryTimer = setTimeout(simulateUserInquiry, 60000); // Start after 1 minute
    
    return () => {
      unsubscribe();
      unsubscribeAdmin();
      clearTimeout(inquiryTimer);
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
      case 'user_inquiry':
        return <Mail className="h-4 w-4 text-orange-500" />;
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
    // Mark activity as read
    setActivities(prev => 
      prev.map(a => 
        a.id === activity.id ? { ...a, read: true } : a
      )
    );
    
    // Navigate to appropriate detail page based on activity type
    if (activity.userId && (activity.type === 'user_registered' || activity.type === 'user_login' || activity.type === 'user_inquiry')) {
      window.location.href = `/admin/users/${activity.userId}`;
    } else if (activity.id.includes('order') || activity.id.includes('report')) {
      // Extract order ID if available and navigate to order details
      const orderId = activity.id.replace('order-', '').replace('order-complete-', '').replace('report-', '');
      if (!isNaN(Number(orderId))) {
        window.location.href = `/admin/orders/${orderId}`;
      } else {
        window.location.href = `/admin/orders`;
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
