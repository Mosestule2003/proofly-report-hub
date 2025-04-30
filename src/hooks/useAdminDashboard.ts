
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { ActivityItem } from '@/components/admin/types';
import { convertToActivityItems } from '@/utils/adminHelpers';

export interface AdminMetricsType {
  tenantCount: number;
  orderCount: number;
  pendingOrderCount: number;
  completedOrderCount: number;
}

export interface Evaluator {
  id: string;
  name: string;
  rating: number;
  evaluationsCompleted: number;
  bio: string;
  avatarUrl?: string;
}

export interface AdminEvaluator extends Evaluator {
  availability: 'Available' | 'Busy';
  specialization: string;
}

export interface Transaction {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
}

export interface Order {
  id: string;
  tenantName: string;
  propertyAddress: string;
  date: string;
  status: string;
  amount: number;
  rating?: number;
  userId: string;
  properties: any[];
  totalPrice: number;
  discount: number;
  createdAt: string;
  evaluator?: Evaluator;
}

export const useAdminDashboard = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetricsType | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [evaluators, setEvaluators] = useState<AdminEvaluator[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Check if mobile on mount and whenever window resizes
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    // Load admin metrics
    api.getAdminMetrics()
      .then(data => {
        setMetrics(data);
      })
      .catch(err => {
        console.error("Failed to load admin metrics:", err);
      });
    
    // Load orders for the pending orders widget
    api.getOrders()
      .then(orders => {
        const pending = orders.filter(order => order.status === 'Pending');
        setPendingOrders(pending as Order[]);
        
        // Also set completed orders for ActivityCards
        const completed = orders.filter(order => 
          order.status === 'Completed' || order.status === 'Report Ready');
        setCompletedOrders(completed as Order[]);
      })
      .catch(err => {
        console.error("Failed to load orders:", err);
      });
    
    // Load sample activity data
    import('@/utils/demoActivityData').then(module => {
      const activityData = module.default;
      setActivityItems(convertToActivityItems(activityData));
    }).catch(err => {
      console.error("Failed to load activity data:", err);
    });
    
    // Load evaluators for the assignment widget
    api.getAllEvaluators()
      .then(data => {
        const typedEvaluators = data.map((evaluator: any) => ({
          id: evaluator.id,
          name: evaluator.name,
          rating: evaluator.rating,
          evaluationsCompleted: evaluator.evaluationsCompleted || 0,
          bio: evaluator.bio || "Professional property evaluator",
          availability: (evaluator.availability === 'Available' || evaluator.availability === 'Busy') 
            ? evaluator.availability 
            : 'Busy' as 'Available' | 'Busy',
          specialization: evaluator.specialization || "Residential properties",
          avatarUrl: evaluator.avatarUrl
        }));
        
        setEvaluators(typedEvaluators);
      })
      .catch(err => {
        console.error("Failed to load evaluators:", err);
      });
    
    // Load sales data for charts
    api.getSalesData()
      .then(data => {
        setSalesData(data);
      })
      .catch(err => {
        console.error("Failed to load sales data:", err);
      });
      
    // Load transaction data for LastTransactions component
    api.getTransactions()
      .then(data => {
        setTransactions(data);
      })
      .catch(err => {
        console.error("Failed to load transactions:", err);
      });
    
    // Subscribe to admin updates
    const unsubscribe = api.subscribeToAdminUpdates((data) => {
      // Handle different update types
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED') {
        // Refresh orders when there's an update
        api.getOrders()
          .then(orders => {
            const pending = orders.filter(order => order.status === 'Pending');
            setPendingOrders(pending as Order[]);
          })
          .catch(err => {
            console.error("Failed to refresh orders:", err);
          });
      }
    });
    
    // Ensure we see all orders (useful when admin logs in after new tenants create orders)
    api.ensureOrdersVisibleToAdmin();
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle assigning evaluator to order
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      // Refresh pending orders
      const allOrders = await api.getOrders();
      const pending = allOrders.filter(order => order.status === 'Pending');
      setPendingOrders(pending as Order[]);
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    metrics,
    pendingOrders,
    evaluators,
    salesData,
    transactions,
    completedOrders,
    activityItems,
    handleUpdateOrderStatus
  };
};
