
import React, { createContext, useContext, useEffect } from 'react';
import useNotifications from '@/hooks/useNotifications';
import notificationService from '@/utils/notificationService';

// Define the context type
interface NotificationsContextType {
  notifications: ReturnType<typeof useNotifications>;
}

// Create the context
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notifications = useNotifications({
    persistLocally: true,
    storageKey: 'proofly_notifications'
  });
  
  useEffect(() => {
    // Listen for global notification broadcasts
    const unsubscribe = notificationService.subscribe((notification) => {
      notifications.addNotification(notification.title, notification.message, {
        type: notification.type,
        showToast: true,
        actionUrl: notification.actionUrl
      });
    });
    
    // Listen for clear all events
    const unsubscribeClear = notificationService.onClear(() => {
      notifications.clearAllNotifications();
    });
    
    return () => {
      unsubscribe();
      unsubscribeClear();
    };
  }, [notifications]);
  
  return (
    <NotificationsContext.Provider value={{ notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Create a hook to use the notifications context
export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};

export default NotificationsContext;
