
import { useState, useCallback, useEffect } from 'react';
import { AppNotification } from '@/components/NotificationBell';
import { toast } from 'sonner';

// Function to generate a unique ID for notifications
const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface UseNotificationsProps {
  initialNotifications?: AppNotification[];
  maxNotifications?: number;
  storageKey?: string;
  persistLocally?: boolean;
}

export const useNotifications = ({
  initialNotifications = [],
  maxNotifications = 50,
  storageKey = 'app_notifications',
  persistLocally = true
}: UseNotificationsProps = {}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  // Load notifications from localStorage on component mount
  useEffect(() => {
    if (persistLocally) {
      try {
        const storedNotifications = localStorage.getItem(storageKey);
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          
          // Ensure each notification has a Date object (not a string)
          const formattedNotifications = parsedNotifications.map((notification: any) => ({
            ...notification,
            date: new Date(notification.date)
          }));
          
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
      }
    }
  }, [persistLocally, storageKey]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (persistLocally && notifications.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [notifications, persistLocally, storageKey]);

  // Add a new notification
  const addNotification = useCallback((
    title: string, 
    message: string, 
    options?: {
      showToast?: boolean;
      type?: 'info' | 'success' | 'warning' | 'error';
      actionUrl?: string;
    }
  ) => {
    const newNotification: AppNotification = {
      id: generateId(),
      title,
      message,
      date: new Date(),
      read: false,
      type: options?.type || 'info',
      actionUrl: options?.actionUrl
    };

    // Show toast notification if requested
    if (options?.showToast) {
      toast(title, {
        description: message,
        action: options.actionUrl ? {
          label: "View",
          onClick: () => window.open(options.actionUrl, '_blank')
        } : undefined
      });
    }

    setNotifications(current => {
      const updatedNotifications = [newNotification, ...current];
      
      // Limit the number of notifications
      if (updatedNotifications.length > maxNotifications) {
        return updatedNotifications.slice(0, maxNotifications);
      }
      
      return updatedNotifications;
    });

    return newNotification.id;
  }, [maxNotifications]);

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(current =>
      current.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(current =>
      current.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Delete a notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(current =>
      current.filter(notification => notification.id !== id)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    if (persistLocally) {
      localStorage.removeItem(storageKey);
    }
  }, [persistLocally, storageKey]);

  // Get count of unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
};

export default useNotifications;
