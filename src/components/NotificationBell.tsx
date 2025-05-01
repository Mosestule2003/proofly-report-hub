
import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/custom-popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { useNotificationsContext } from '@/context/NotificationsContext';
import { cn, formatTimeToNow } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertTriangle,
}

const toastType = {
  info: "default",
  success: "success",
  warning: "warning",
  error: "destructive",
}

const NotificationBell: React.FC = () => {
  const { notifications } = useNotificationsContext();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleNotificationClick = (notification: AppNotification) => {
    notifications.markAsRead(notification.id);
    
    // Show toast about the notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: toastType[notification.type] as any,
    });
    
    if (notification.actionUrl) {
      // Close the popover
      setOpen(false);
      
      // Navigate to the action URL
      navigate(notification.actionUrl);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          role="button"
          aria-label="View notifications"
          ref={buttonRef}
        >
          <Bell className="h-5 w-5" />
          {notifications.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
              {notifications.unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80" 
        align="end" 
        side="bottom"
        sideOffset={10}
        withArrow
      >
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Notifications</div>
          <Button variant="ghost" size="sm" onClick={notifications.clearAllNotifications}>
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[300px] pr-1">
          {notifications.notifications.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">
              No notifications
            </div>
          ) : (
            notifications.notifications.map((notification) => {
              const Icon = icons[notification.type] || Info;
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group flex items-center space-x-2 py-2 border-b last:border-b-0",
                    notification.read ? "opacity-60" : "font-semibold",
                    notification.actionUrl ? "cursor-pointer hover:bg-muted/50 rounded-md px-2" : ""
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", {
                    "text-blue-500": notification.type === 'info',
                    "text-green-500": notification.type === 'success',
                    "text-yellow-500": notification.type === 'warning',
                    "text-red-500": notification.type === 'error',
                  })} />
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <time className="text-xs text-blue-600">
                      {formatTimeToNow(notification.date)}
                    </time>
                  </div>
                  <div className="ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent click handler
                        notifications.deleteNotification(notification.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
