import { toast } from 'sonner';
import { Property, LandlordInfo } from '@/context/CartContext';
import { AppNotification } from '@/components/NotificationBell';
import { Evaluator } from '@/components/EvaluatorProfile';

// Define User type locally to avoid circular dependency with AuthContext
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'admin';
  createdAt?: string;
};

// Define local users array to avoid circular dependency
// We'll sync this with the AuthContext's mockUsers when needed
let users: User[] = [
  { id: '1', email: 'tenant@example.com', name: 'Demo Tenant', role: 'tenant', createdAt: new Date().toISOString() },
  { id: '2', email: 'admin@example.com', name: 'Admin User', role: 'admin', createdAt: new Date().toISOString() },
];

export type OrderStatus = 'Pending' | 'Evaluator Assigned' | 'In Progress' | 'Report Ready';
export type OrderStepStatus = 
  'PENDING_MATCH' | 
  'OUTREACH_INITIATED' | 
  'OUTREACH_SCHEDULING' | 
  'OUTREACH_SCHEDULED' |
  'EN_ROUTE' | 
  'ARRIVED' | 
  'EVALUATING' | 
  'COMPLETED' | 
  'REPORT_READY';

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

// Mock data for sales
const mockSalesData = [
  { name: 'Mon', amount: 120 },
  { name: 'Tue', amount: 180 },
  { name: 'Wed', amount: 200 },
  { name: 'Thu', amount: 150 },
  { name: 'Fri', amount: 230 },
  { name: 'Sat', amount: 180 },
  { name: 'Sun', amount: 120 },
];

// Define type for transactions
export type Transaction = {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
};

// Mock data store
let orders: Order[] = [];
let reports: Report[] = [];
let notifications: { [userId: string]: AppNotification[] } = {};
let salesData = [...mockSalesData];
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
  'sales': [], // Add sales channel
  'users': [], // Add users channel
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
    read: false,
    type: 'info' // Default type
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
    
    // Verify all properties have landlord information
    const allPropertiesHaveLandlord = properties.every(prop => 
      prop.landlordInfo?.name && prop.landlordInfo?.email && prop.landlordInfo?.phone
    );
    
    if (!allPropertiesHaveLandlord) {
      throw new Error("All properties must have landlord information");
    }
    
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
    
    // Update sales data when order is created
    const today = new Date().getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[today];
    
    // Update sales data for today
    const dayIndex = salesData.findIndex(item => item.name === dayName);
    if (dayIndex !== -1) {
      salesData[dayIndex].amount += totalPrice;
    } else {
      salesData.push({ name: dayName, amount: totalPrice });
    }
    
    // Notify sales listeners
    notifyWebSocketListeners('sales', { type: 'SALES_UPDATED', sales: salesData });
    
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
  
  // Order step simulation - Updated to include outreach steps
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
      newStep = 'OUTREACH_INITIATED'; // Now we start with outreach instead of en route
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
      
      // Add notification for outreach
      addNotification(
        order.userId,
        'AI Outreach Initiated',
        `We're contacting the landlord for ${order.properties[newPropertyIndex].address.split(',')[0]}.`
      );
    } 
    // New outreach steps
    else if (newStep === 'OUTREACH_INITIATED') {
      newStep = 'OUTREACH_SCHEDULING';
      
      // Add notification for scheduling
      addNotification(
        order.userId,
        'Scheduling in Progress',
        `Coordinating viewing times for ${order.properties[newPropertyIndex].address.split(',')[0]}.`
      );
    } 
    else if (newStep === 'OUTREACH_SCHEDULING') {
      newStep = 'OUTREACH_SCHEDULED';
      
      // Add notification for scheduled
      const viewingDate = new Date();
      viewingDate.setDate(viewingDate.getDate() + 1); // Tomorrow
      const dateStr = viewingDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric'
      });
      
      addNotification(
        order.userId,
        'Viewing Scheduled',
        `Viewing confirmed for ${order.properties[newPropertyIndex].address.split(',')[0]} on ${dateStr}.`
      );
    } 
    else if (newStep === 'OUTREACH_SCHEDULED') {
      newStep = 'EN_ROUTE';
      newStatus = 'In Progress';
      
      // Add notification for en route
      addNotification(
        order.userId,
        'Evaluator En Route',
        `The evaluator is on their way to ${order.properties[newPropertyIndex].address.split(',')[0]}.`
      );
    }
    // Original evaluation steps
    else if (newStep === 'EN_ROUTE') {
      newStep = 'ARRIVED';
      
      // Add notification for user
      addNotification(
        order.userId,
        'Evaluator Arrived',
        `The evaluator has arrived at ${order.properties[newPropertyIndex].address.split(',')[0]}.`
      );
    } else if (newStep === 'ARRIVED') {
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
        newStep = 'OUTREACH_INITIATED'; // Start with outreach for the next property
        
        // Add notification for user
        addNotification(
          order.userId,
          'Starting Next Property',
          `Beginning outreach for ${order.properties[newPropertyIndex].address.split(',')[0]}.`
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
      tenantCount: users.filter(u => u.role === 'tenant').length,
      orderCount: orders.length,
      pendingOrderCount: orders.filter(o => o.status !== 'Report Ready').length,
      completedOrderCount: orders.filter(o => o.status === 'Report Ready').length,
    };
  },
  
  // Get transactions for LastTransactions component
  getTransactions: async (): Promise<Transaction[]> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    
    // Convert orders to transactions
    return orders.map(order => ({
      id: order.id,
      amount: order.totalPrice - order.discount,
      status: order.status === 'Report Ready' ? 'completed' : 'pending',
      date: order.createdAt,
      description: `Property evaluation${order.properties.length > 1 ? 's' : ''} (${order.properties.length} ${order.properties.length > 1 ? 'properties' : 'property'})`
    }));
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
  
  // Sales data
  getSalesData: async (): Promise<any[]> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    
    return salesData;
  },
  
  // Users methods
  getAllUsers: async (): Promise<User[]> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    return users;
  },
  
  getUserById: async (userId: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 300));
    
    const user = users.find(u => u.id === userId);
    return user || null;
  },
  
  updateUser: async (userId: string, userData: Partial<User>): Promise<User | null> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    // Find user to update
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      // Don't allow changing these fields
      id: users[userIndex].id,
      role: userData.role || users[userIndex].role,
    };
    
    // Update users array
    users[userIndex] = updatedUser;
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('users', { 
      type: 'USERS_UPDATED', 
      users,
      updatedUser 
    });
    
    return updatedUser;
  },
  
  updateUserPassword: async (userId: string, newPassword: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    
    // Find user to update
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // In a real app, we would hash the password, but here we just pretend we did
    console.log(`Password updated for user ${users[userIndex].name}`);
    
    return true;
  },
  
  deleteUser: async (userId: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    // Find user to delete
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Store user for reference
    const deletedUser = users[userIndex];
    
    // Remove user from users array
    users = users.filter(u => u.id !== userId);
    
    // Remove user orders
    orders = orders.filter(order => {
      if (order.userId === userId) {
        // Find any reports associated with this order
        reports = reports.filter(report => report.orderId !== order.id);
        return false; // Remove this order
      }
      return true; // Keep other orders
    });
    
    // Remove user notifications
    delete notifications[userId];
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('users', { 
      type: 'USERS_UPDATED', 
      users,
      deletedUserId: userId 
    });
    
    console.log(`User ${deletedUser.name} (${userId}) deleted successfully`);
    
    return true;
  },
  
  createUser: async (userData: { name: string; email: string; password: string; role: 'admin' | 'tenant' }): Promise<User> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    
    // Validate email is unique
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users = [...users, newUser];
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('users', { 
      type: 'USERS_UPDATED', 
      users,
      newUser
    });
    
    console.log(`New user created: ${newUser.name} (${newUser.role})`);
    
    return newUser;
  },
  
  // Impersonation functionality
  impersonateUser: async (userId: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    // Find user to impersonate
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Set the impersonated user in localStorage to simulate login
    localStorage.setItem('proofly_user', JSON.stringify(user));
    
    console.log(`Admin is now impersonating ${user.name}`);
    
    return true;
  },
  
  // Return to admin after impersonating
  returnToAdmin: async (): Promise<boolean> => {
    // Get the stored admin user ID
    const adminUserId = localStorage.getItem('admin_return_user');
    
    if (!adminUserId) {
      throw new Error('No admin user to return to');
    }
    
    // Find the admin user
    const adminUser = users.find(u => u.id === adminUserId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Admin user not found');
    }
    
    // Set the admin user in localStorage to simulate login
    localStorage.setItem('proofly_user', JSON.stringify(adminUser));
    
    // Remove the stored admin user ID
    localStorage.removeItem('admin_return_user');
    
    console.log(`Returned to admin ${adminUser.name}`);
    
    return true;
  },
  
  // New subscription methods
  subscribeToSalesUpdates: (callback: WebSocketCallback) => {
    webSocketListeners['sales'].push(callback);
    
    // Return an unsubscribe function
    return () => {
      const index = webSocketListeners['sales'].indexOf(callback);
      if (index !== -1) {
        webSocketListeners['sales'].splice(index, 1);
      }
    };
  },
  
  subscribeToUserUpdates: (callback: WebSocketCallback) => {
    webSocketListeners['users'].push(callback);
    
    // Return an unsubscribe function
    return () => {
      const index = webSocketListeners['users'].indexOf(callback);
      if (index !== -1) {
        webSocketListeners['users'].splice(index, 1);
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
        price: 30,
        landlordInfo: {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '555-123-4567',
          company: 'Smith Properties'
        }
      },
      {
        id: '2',
        address: '456 Oak Ave, Anytown, USA',
        description: 'Apartment in downtown area',
        price: 30,
        landlordInfo: {
          name: 'Emma Johnson',
          email: 'emma@example.com',
          phone: '555-987-6543',
          company: 'City Apartments'
        }
      }
    ];
    
    const mockProperties2: Property[] = [
      {
        id: '3',
        address: '789 Pine Rd, Anytown, USA',
        description: 'Townhouse with garage',
        price: 45,
        landlordInfo: {
          name: 'Robert Williams',
          email: 'robert@example.com',
          phone: '555-567-8901'
        }
      },
    ];
    
    // Find tenant ID or use default
    const tenantId = users.find(u => u.role === 'tenant')?.id || '1';
    
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
          read: true,
          type: 'info'
        },
        {
          id: '302',
          title: 'Order Received',
          message: 'Your evaluation request for 2 properties has been received.',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          read: true,
          type: 'info'
        },
        {
          id: '303',
          title: 'Report Ready',
          message: 'Your property evaluation report is now available to view.',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          read: false,
          type: 'success'
        },
        {
          id: '304',
          title: 'New Feature Available',
          message: 'We have added multi-property evaluation support to our platform.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          read: false,
          type: 'info'
        }
      ];
    }
    
    // Simulate some initial sales data
    if (currentUser.role === 'admin') {
      // Notify sales listeners with initial data
      notifyWebSocketListeners('sales', { type: 'SALES_UPDATED', sales: salesData });
      
      // Notify user listeners
      notifyWebSocketListeners('users', { type: 'USERS_UPDATED', users });
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
  },
  
  // Sync method to update our local users array with AuthContext's mockUsers
  // This is called from AuthContext to keep the data in sync
  syncUsers: (authUsers: User[]) => {
    users = [...authUsers];
    console.log("API service: Users synced with AuthContext");
  }
};
