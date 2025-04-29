
import { AppNotification } from '@/components/NotificationBell';

// Create a simple event emitter for notifications
type Listener = (notification: AppNotification) => void;
type ClearListener = () => void;

class NotificationService {
  private listeners: Listener[] = [];
  private clearListeners: ClearListener[] = [];

  // Broadcast a notification to all listeners
  public broadcast(notification: AppNotification): void {
    this.listeners.forEach(listener => listener(notification));
  }
  
  // Add a listener for notifications
  public subscribe(callback: Listener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  // Signal to clear all notifications
  public clearAll(): void {
    this.clearListeners.forEach(listener => listener());
  }
  
  // Add a listener for clear events
  public onClear(callback: ClearListener): () => void {
    this.clearListeners.push(callback);
    return () => {
      this.clearListeners = this.clearListeners.filter(listener => listener !== callback);
    };
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();

export default notificationService;
