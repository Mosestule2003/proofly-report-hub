import { toast } from 'sonner';
import { Property } from '@/context/CartContext';
import { User } from '@/context/AuthContext';

export type OrderStatus = 'Pending' | 'Evaluator Assigned' | 'In Progress' | 'Report Ready';

export type Order = {
  id: string;
  userId: string;
  properties: Property[];
  totalPrice: number;
  discount: number;
  status: OrderStatus;
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

// Mock data store
let orders: Order[] = [];
let reports: Report[] = [];

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
      createdAt: new Date().toISOString(),
    };
    
    orders = [...orders, newOrder];
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
    return newReport;
  },
  
  getReportForOrder: async (orderId: string): Promise<Report | null> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const report = reports.find(r => r.orderId === orderId);
    return report || null;
  },
  
  // Initialize with some mock data for demo
  initMockData: (currentUser: User) => {
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
    
    const tenantId = currentUser.role === 'tenant' ? currentUser.id : '1';
    
    // Add completed order with report
    const order1: Order = {
      id: '101',
      userId: tenantId,
      properties: mockProperties1,
      totalPrice: 60,
      discount: 0,
      status: 'Report Ready',
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
  }
};
