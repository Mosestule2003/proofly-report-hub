import { toast } from 'sonner';
import { Property } from '@/context/CartContext';
import { User, mockUsers } from '@/context/AuthContext';

export type OrderStatus = 'Pending' | 'Evaluator Assigned' | 'In Progress' | 'Report Ready';
export type OrderStepStatus = 'PENDING_MATCH' | 'EN_ROUTE' | 'ARRIVED' | 'EVALUATING' | 'COMPLETED' | 'REPORT_READY';

export type Order = {
  id: string;
  userId: string;
  properties: Property[];
  totalPrice: number;
  discount: number;
  status: OrderStatus;
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

// Mock data store
let orders: Order[] = [];
let reports: Report[] = [];

// WebSocket simulation (in a real app, this would be a real WebSocket connection)
type WebSocketCallback = (data: any) => void;
const webSocketListeners: { [key: string]: WebSocketCallback[] } = {
  'orders': [],
  'admin': [],
};

const notifyWebSocketListeners = (channel: string, data: any) => {
  webSocketListeners[channel]?.forEach(callback => {
    setTimeout(() => callback(data), 0);
  });
};

// Mock API functions
export const api = {
  // Orders
  createOrder: async (userId: string, properties: Property[], totalPrice: number, discount: number): Promise<Order> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    
    const newOrder: Order = {
      id: crypto.randomUUID(),
      userId,
      properties,
      totalPrice,
      discount,
      status: 'Pending',
      currentStep: 'PENDING_MATCH',
      currentPropertyIndex: 0,
      createdAt: new Date().toISOString(),
    };
    
    orders = [...orders, newOrder];
    
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
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
    };
    
    // Notify WebSocket listeners
    notifyWebSocketListeners('orders', { 
      type: 'ORDER_UPDATED', 
      orderId, 
      status,
    });
    notifyWebSocketListeners('admin', { 
      type: 'ORDER_UPDATED', 
      orderId, 
      status,
    });
    
    return orders[orderIndex];
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
    } else if (newStep === 'EN_ROUTE') {
      newStep = 'ARRIVED';
    } else if (newStep === 'ARRIVED') {
      newStatus = 'In Progress';
      newStep = 'EVALUATING';
    } else if (newStep === 'EVALUATING') {
      newStep = 'COMPLETED';
    } else if (newStep === 'COMPLETED') {
      // Move to the next property or finish
      if (newPropertyIndex < propertyCount - 1) {
        newPropertyIndex++;
        newStep = 'EN_ROUTE';
      } else {
        newStep = 'REPORT_READY';
        newStatus = 'Report Ready';
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
  
  // Admin
  getAdminMetrics: async (): Promise<AdminMetrics> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    return {
      tenantCount: 5, // Mock data
      orderCount: orders.length,
      pendingOrderCount: orders.filter(o => o.status !== 'Report Ready').length,
      completedOrderCount: orders.filter(o => o.status === 'Report Ready').length,
    };
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
      status: 'Report Ready',
      currentStep: 'REPORT_READY',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
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
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
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
