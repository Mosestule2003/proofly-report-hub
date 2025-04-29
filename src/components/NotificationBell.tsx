
import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Rename to AppNotification to avoid conflict with browser's Notification API
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [open, setOpen] = useState(false);
  const [newNotificationReceived, setNewNotificationReceived] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  useEffect(() => {
    // Check if there's a new unread notification that wasn't there before
    const hasNewNotification = unreadCount > 0 && notifications.some(n => !n.read && new Date().getTime() - new Date(n.date).getTime() < 60000);
    
    if (hasNewNotification && !open) {
      setNewNotificationReceived(true);
      // Show toast for newest notification
      const newestNotification = [...notifications]
        .filter(n => !n.read)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (newestNotification) {
        toast(newestNotification.title, {
          description: newestNotification.message,
          action: {
            label: "View",
            onClick: () => {
              setOpen(true);
              setNewNotificationReceived(false);
            }
          }
        });
      }
    }
  }, [notifications, unreadCount, open]);
  
  // When popover opens, stop animation
  useEffect(() => {
    if (open) {
      setNewNotificationReceived(false);
    }
  }, [open]);
  
  const handleNotificationClick = (id: string) => {
    onMarkAsRead(id);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={`relative ${newNotificationReceived ? 'animate-pulse' : ''}`}
        >
          {newNotificationReceived 
            ? <BellRing className="h-5 w-5 text-primary" /> 
            : <Bell className="h-5 w-5" />
          }
          {unreadCount > 0 && (
            <Badge 
              className={`absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 ${
                newNotificationReceived ? 'bg-primary' : ''
              }`}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[calc(100vh-100px)]" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="h-8 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 border-b last:border-0 cursor-pointer hover:bg-accent/50 transition-colors ${
                  !notification.read ? 'bg-accent/30' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <h5 className="font-medium text-sm">{notification.title}</h5>
                    {!notification.read && (
                      <Badge className="ml-2 bg-primary/20 text-primary border-primary/20 px-1.5 py-0 text-[10px]">
                        New
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(notification.date)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <div className="flex justify-end mt-2">
                  {!notification.read ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs px-2" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark as read
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      Read
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 flex justify-center border-t">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return new Date(date).toLocaleDateString();
};

export default NotificationBell;
