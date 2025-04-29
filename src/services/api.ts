import { toast } from 'sonner';
import { Property } from '@/context/CartContext';
import { User, mockUsers } from '@/context/AuthContext';
import { AppNotification } from '@/components/NotificationBell';
import { Evaluator } from '@/components/EvaluatorProfile';

export type OrderStatus = 'Pending' | 'Evaluator Assigned' | 'In Progress' | 'Report Ready';
export type OrderStepStatus = 'PENDING_MATCH' | 'EN_ROUTE' | 'ARRIVED' | 'EVALUATING' | 'COMPLETED' | 'REPORT_READY';

export type Order = {
  id: string;
  userId: string;
  properties: Property[];
  totalPrice: number;
  discount: number;
  status: OrderStatus;
  evaluator?: Evaluator;
  agentContact?: AgentContact;
  currentStep?: OrderStepStatus;
  currentPropertyIndex?: number;
  evaluatorLocation?: { lat: number; lng: number };
  createdAt: string;
};

export type Report = {
  id: string;
  orderId: string;
  comments: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
};

export type AdminMetrics = {
  tenantCount: number;
  orderCount: number;
  pendingOrderCount: number;
  completedOrderCount: number;
};

export type AgentContact = {
  name: string;
  email: string;
  phone: string;
  company?: string;
};

// Mock data store
let orders: Order[] = [];
let reports: Report[] = [];
let notifications: { [userId: string]: AppNotification[] } = {};
let evaluators: Evaluator[] = [
  {
    id: 'eval1',
    name: 'Sarah Johnson',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.8,
    evaluationsCompleted: 342,
    bio: 'Professional property evaluator with 7+ years of experience. Specialized in residential properties and commercial spaces.'
  },
  {
    id: 'eval2',
    name: 'Michael Chen',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.9,
    evaluationsCompleted: 518,
    bio: 'Certified property inspector with background in real estate. Thorough and detail-oriented evaluator.'
  },
  {
    id: 'eval3',
    name: 'Alexa Rodriguez',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4.7,
    evaluationsCompleted: 271,
    bio: 'Specialized in luxury properties and historic buildings. Former architect with deep understanding of structural elements.'
  }
];

// WebSocket simulation (in a real app, this would be a real WebSocket connection)
type WebSocketCallback = (data: any) => void;
const webSocketListeners: { [key: string]: WebSocketCallback[] } = {
  'orders': [],
  'admin': [],
  'notifications': [],
};

const notifyWebSocketListeners = (channel: string, data: any) => {
  webSocketListeners[channel]?.forEach(callback => {
    setTimeout(() => callback(data), 0);
  });
};

// Helper to create a new notification
const addNotification = (userId: string, title: string, message: string) => {
  if (!notifications[userId]) {
    notifications[userId] = [];
  }
  
  const newNotification: AppNotification = {
    id: crypto.randomUUID(),
    title,
    message,
    date: new Date(),
    read: false
  };
  
  notifications[userId] = [newNotification, ...notifications[userId]];
  
  // Notify WebSocket listeners about new notification
  notifyWebSocketListeners('notifications', {
    type: 'NEW_NOTIFICATION',
    userId,
    notification: newNotification
  });
  
  return newNotification;
};

// Mock API functions
export const api = {
  // Orders
  createOrder: async (
    userId: string, 
    properties: Property[], 
    totalPrice: number, 
    discount: number,
    agentContact?: AgentContact
  ): Promise<Order> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    
    const newOrder: Order = {
      id: crypto.randomUUID(),
      userId,
      properties,
      totalPrice,
      discount,
      agentContact,
      status: 'Pending',
      currentStep: 'PENDING_MATCH',
      currentPropertyIndex: 0,
      createdAt: new Date().toISOString(),
    };
    
    orders = [...orders, newOrder];
    
    // Add notification for user
    addNotification(
      userId,
      'Order Received',
      `Your evaluation request for ${properties.length} ${
        properties.length === 1 ? 'property' : 'properties'
      } has been received.`
    );
    
    // Notify WebSocket listeners - ensure admin gets updates for ALL orders
    notifyWebSocketListeners('orders', { type: 'ORDER_CREATED', order: newOrder });
    notifyWebSocketListeners('admin', { type: 'ORDER_CREATED', order: newOrder });
    
    // Log the order creation for debugging
    console.log(`Order created for user ${userId}:`, newOrder);
    console.log(`Total orders in system: ${orders.length}`);
    
    return newOrder;
  },
  
  getOrders: async (userId?: string): Promise<Order[]> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    // If userId provided, filter orders by user
    if (userId) {
      return orders.filter(order => order.userId === userId);
    }
    
    // Otherwise return all orders (admin view)
    return orders;
  },
  
  getOrderById: async (orderId: string): Promise<Order | null> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 300));
    
    const order = orders.find(o => o.id === orderId);
    return order || null;
  },
  
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return null;
    }
    
    const updatedOrder = {
      ...orders[orderIndex],
      status,
    };
    
    // If status is changing to Evaluator Assigned, assign an evaluator
    if (status === 'Evaluator Assigned' && !updatedOrder.evaluator) {
      // Randomly select an evaluator
      const randomEvaluator = evaluators[Math.floor(Math.random() * evaluators.length)];
      updatedOrder.evaluator = randomEvaluator;
      
      // Add notification for user
      addNotification(
        updatedOrder.userId,
        'Evaluator Assigned',
        `${randomEvaluator.name} has been assigned to your evaluation request.`
      );
    }
    
    orders[orderIndex] = updatedOrder;
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('orders', { 
      type: 'ORDER_UPDATED', 
      orderId, 
      status,
      evaluator: updatedOrder.evaluator
    });
    
    notifyWebSocketListeners('admin', { 
      type: 'ORDER_UPDATED', 
      orderId, 
      status,
      evaluator: updatedOrder.evaluator
    });
    
    return updatedOrder;
  },
  
  // Order step simulation
  advanceOrderStep: async (orderId: string): Promise<Order | null> => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return null;
    }
    
    const order = orders[orderIndex];
    const propertyCount = order.properties.length;
    
    let newStatus: OrderStatus = order.status;
    let newStep: OrderStepStatus = order.currentStep || 'PENDING_MATCH';
    let newPropertyIndex = order.currentPropertyIndex || 0;
    
    // Advance the step based on current state
    if (newStep === 'PENDING_MATCH') {
      newStatus = 'Evaluator Assigned';
      newStep = 'EN_ROUTE';
      newPropertyIndex = 0;
      
      // Randomly select an evaluator if not already assigned
      if (!order.evaluator) {
        const randomEvaluator = evaluators[Math.floor(Math.random() * evaluators.length)];
        order.evaluator = randomEvaluator;
        
        // Add notification for user
        addNotification(
          order.userId,
          'Evaluator Assigned',
          `${randomEvaluator.name} has been assigned to your evaluation request.`
        );
      }
    } else if (newStep === 'EN_ROUTE') {
      newStep = 'ARRIVED';
      
      // Add notification for user
      addNotification(
        order.userId,
        'Evaluator Arrived',
        `The evaluator has arrived at ${order.properties[newPropertyIndex].address.split(',')[0]}.`
      );
    } else if (newStep === 'ARRIVED') {
      newStatus = 'In Progress';
      newStep = 'EVALUATING';
      
      // Add notification for user
      addNotification(
        order.userId,
        'Evaluation in Progress',
        `Evaluation has started at ${order.properties[newPropertyIndex].address.split(',')[0]}.`
      );
    } else if (newStep === 'EVALUATING') {
      newStep = 'COMPLETED';
      
      // Add notification for user
      addNotification(
        order.userId,
        'Property Evaluated',
        `Evaluation completed for ${order.properties[newPropertyIndex].address.split(',')[0]}.`
      );
    } else if (newStep === 'COMPLETED') {
      // Move to the next property or finish
      if (newPropertyIndex < propertyCount - 1) {
        newPropertyIndex++;
        newStep = 'EN_ROUTE';
        
        // Add notification for user
        addNotification(
          order.userId,
          'Moving to Next Property',
          `Evaluator is now en route to ${order.properties[newPropertyIndex].address.split(',')[0]}.`
        );
      } else {
        newStep = 'REPORT_READY';
        newStatus = 'Report Ready';
        
        // Add notification for user
        addNotification(
          order.userId,
          'Evaluation Complete',
          `All properties have been evaluated successfully. Report is being prepared.`
        );
      }
    }
    
    // Update order with new state
    orders[orderIndex] = {
      ...order,
      status: newStatus,
      currentStep: newStep,
      currentPropertyIndex: newPropertyIndex,
    };
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('orders', { 
      type: 'ORDER_STEP_UPDATE', 
      orderId,
      status: newStatus,
      step: newStep,
      propertyIndex: newPropertyIndex,
    });
    
    notifyWebSocketListeners('admin', { 
      type: 'ORDER_STEP_UPDATE', 
      orderId,
      status: newStatus,
      step: newStep,
      propertyIndex: newPropertyIndex,
    });
    
    return orders[orderIndex];
  },
  
  // Reports
  createReport: async (orderId: string, comments: string, imageUrl?: string, videoUrl?: string): Promise<Report> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    
    // Update order status
    await api.updateOrderStatus(orderId, 'Report Ready');
    
    const newReport: Report = {
      id: crypto.randomUUID(),
      orderId,
      comments,
      imageUrl,
      videoUrl,
      createdAt: new Date().toISOString(),
    };
    
    reports = [...reports, newReport];
    
    // Find user for notification
    const order = orders.find(o => o.id === orderId);
    if (order) {
      // Add notification for user
      addNotification(
        order.userId,
        'Report Ready',
        `Your property evaluation report is now available to view.`
      );
    }
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('orders', { 
      type: 'REPORT_CREATED', 
      report: newReport 
    });
    
    notifyWebSocketListeners('admin', { 
      type: 'REPORT_CREATED', 
      report: newReport 
    });
    
    return newReport;
  },
  
  getReportForOrder: async (orderId: string): Promise<Report | null> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const report = reports.find(r => r.orderId === orderId);
    return report || null;
  },
  
  // Notifications
  getNotifications: async (userId: string): Promise<AppNotification[]> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 300));
    
    return notifications[userId] || [];
  },
  
  markNotificationAsRead: async (userId: string, notificationId: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 200));
    
    if (!notifications[userId]) return false;
    
    const notificationIndex = notifications[userId].findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) return false;
    
    notifications[userId][notificationIndex].read = true;
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('notifications', {
      type: 'NOTIFICATION_READ',
      userId,
      notificationId
    });
    
    return true;
  },
  
  markAllNotificationsAsRead: async (userId: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 200));
    
    if (!notifications[userId]) return false;
    
    notifications[userId] = notifications[userId].map(notification => ({
      ...notification,
      read: true
    }));
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('notifications', {
      type: 'ALL_NOTIFICATIONS_READ',
      userId
    });
    
    return true;
  },
  
  subscribeToNotifications: (userId: string, callback: WebSocketCallback) => {
    // Special listener for notifications for this specific user
    const handler = (data: any) => {
      if (data.userId === userId) {
        callback(data);
      }
    };
    
    webSocketListeners['notifications'].push(handler);
    
    // Return an unsubscribe function
    return () => {
      const index = webSocketListeners['notifications'].indexOf(handler);
      if (index !== -1) {
        webSocketListeners['notifications'].splice(index, 1);
      }
    };
  },
  
  // Admin
  getAdminMetrics: async (): Promise<AdminMetrics> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    return {
      tenantCount: mockUsers.filter(u => u.role === 'tenant').length,
      orderCount: orders.length,
      pendingOrderCount: orders.filter(o => o.status !== 'Report Ready').length,
      completedOrderCount: orders.filter(o => o.status === 'Report Ready').length,
    };
  },
  
  // Evaluators
  getAllEvaluators: async (): Promise<Evaluator[]> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 300));
    
    return evaluators;
  },
  
  getEvaluatorById: async (id: string): Promise<Evaluator | null> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 200));
    
    const evaluator = evaluators.find(e => e.id === id);
    return evaluator || null;
  },
  
  // WebSocket simulation
  subscribeToOrders: (userId: string, callback: WebSocketCallback) => {
    webSocketListeners['orders'].push(callback);
    
    // Return an unsubscribe function
    return () => {
      const index = webSocketListeners['orders'].indexOf(callback);
      if (index !== -1) {
        webSocketListeners['orders'].splice(index, 1);
      }
    };
  },
  
  subscribeToAdminUpdates: (callback: WebSocketCallback) => {
    webSocketListeners['admin'].push(callback);
    
    // Return an unsubscribe function
    return () => {
      const index = webSocketListeners['admin'].indexOf(callback);
      if (index !== -1) {
        webSocketListeners['admin'].splice(index, 1);
      }
    };
  },
  
  // Initialize with some mock data for demo
  initMockData: (currentUser: User) => {
    if (orders.length > 0) {
      // Only initialize once to avoid duplicate data
      console.log('Mock data already initialized, skipping');
      return;
    }
    
    const mockProperties1: Property[] = [
      {
        id: '1',
        address: '123 Main St, Anytown, USA',
        description: 'Single family home with backyard',
        price: 30
      },
      {
        id: '2',
        address: '456 Oak Ave, Anytown, USA',
        description: 'Apartment in downtown area',
        price: 30
      }
    ];
    
    const mockProperties2: Property[] = [
      {
        id: '3',
        address: '789 Pine Rd, Anytown, USA',
        description: 'Townhouse with garage',
        price: 45
      },
    ];
    
    // Find tenant ID or use default
    const tenantId = mockUsers.find(u => u.role === 'tenant')?.id || '1';
    
    // Add completed order with report
    const order1: Order = {
      id: '101',
      userId: tenantId,
      properties: mockProperties1,
      totalPrice: 60,
      discount: 0,
      evaluator: evaluators[0],
      status: 'Report Ready',
      currentStep: 'REPORT_READY',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      agentContact: {
        name: 'Jack Thompson',
        email: 'jack@realty.com',
        phone: '555-123-4567',
        company: 'City Realty'
      }
    };
    
    // Add pending order
    const order2: Order = {
      id: '102',
      userId: tenantId,
      properties: mockProperties2,
      totalPrice: 45,
      discount: 0,
      status: 'Pending',
      currentStep: 'PENDING_MATCH',
      currentPropertyIndex: 0,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      agentContact: {
        name: 'Lisa Chen',
        email: 'lisa@homes.com',
        phone: '555-987-6543',
        company: 'Modern Homes'
      }
    };
    
    // Create report for completed order
    const report1: Report = {
      id: '201',
      orderId: '101',
      comments: 'Both properties are in good condition. The apartment has some minor maintenance issues that should be addressed before listing.',
      imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
      videoUrl: 'https://example.com/video1.mp4',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    };
    
    orders = [order1, order2];
    reports = [report1];
    
    // Create sample notifications
    if (tenantId) {
      notifications[tenantId] = [
        {
          id: '301',
          title: 'Welcome to Proofly',
          message: 'Thank you for joining our property evaluation platform.',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          read: true
        },
        {
          id: '302',
          title: 'Order Received',
          message: 'Your evaluation request for 2 properties has been received.',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          read: true
        },
        {
          id: '303',
          title: 'Report Ready',
          message: 'Your property evaluation report is now available to view.',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          read: false
        },
        {
          id: '304',
          title: 'New Feature Available',
          message: 'We have added multi-property evaluation support to our platform.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          read: false
        }
      ];
    }
    
    console.log('Mock data initialized for', currentUser.role);
  },
  
  // Method to ensure orders from new users show up
  ensureOrdersVisibleToAdmin: () => {
    // This function is called on admin login to ensure all users' orders are visible
    console.log(`Ensuring all ${orders.length} orders are visible to admin`);
    
    // Re-notify all orders to admin channel
    orders.forEach(order => {
      notifyWebSocketListeners('admin', { 
        type: 'ORDER_UPDATED', 
        orderId: order.id, 
        status: order.status,
      });
    });
  }
};
