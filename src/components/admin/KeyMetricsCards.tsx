import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, BarChart3, CircleDollarSign, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { api } from '@/services/api';
import { useNotificationsContext } from '@/context/NotificationsContext';

// Define the Order interface to match with what we're using
interface Order {
  id: string;
  tenantName?: string;
  propertyAddress?: string;
  date?: string;
  status: string;
  userId: string;
  properties: any[];
  totalPrice: number;
  discount: number;
  createdAt: string;
}

interface KeyMetricsCardsProps {
  orders: Order[];
}

interface MetricsHistory {
  properties: { current: number, previous: number };
  evaluations: { current: number, previous: number };
  revenue: { current: number, previous: number };
  users: { current: number, previous: number };
}

const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({ orders = [] }) => {
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistory>({
    properties: { current: 0, previous: 0 },
    evaluations: { current: 0, previous: 0 },
    revenue: { current: 0, previous: 0 },
    users: { current: 0, previous: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { notifications } = useNotificationsContext();
  
  // Track if we've already sent notifications to prevent duplicates
  const notificationSentRef = useRef<boolean>(false);
  // Track previous metrics to only notify on actual changes
  const prevMetricsRef = useRef<MetricsHistory | null>(null);
  
  // Load historical metrics for comparison
  useEffect(() => {
    const loadHistoricalMetrics = async () => {
      setIsLoading(true);
      try {
        // Get current metrics
        const allOrders = await api.getOrders();
        const users = await api.getAllUsers();
        
        // Calculate current metrics
        const totalProperties = allOrders.reduce((acc, order) => 
          acc + (Array.isArray(order.properties) ? order.properties.length : 0), 0);
        
        const totalRevenue = allOrders.reduce((acc, order) => {
          return acc + order.totalPrice;
        }, 0);
        
        // Simulate previous period (for demo, using 80-90% of current values)
        const prevProperties = Math.floor(totalProperties * (0.8 + Math.random() * 0.1));
        const prevEvaluations = Math.floor(allOrders.length * (0.8 + Math.random() * 0.1));
        const prevRevenue = Math.floor(totalRevenue * (0.8 + Math.random() * 0.1));
        const prevUsers = Math.floor(users.length * (0.8 + Math.random() * 0.1));
        
        const newMetrics = {
          properties: { current: totalProperties, previous: prevProperties },
          evaluations: { current: allOrders.length, previous: prevEvaluations },
          revenue: { current: totalRevenue, previous: prevRevenue },
          users: { current: users.length, previous: prevUsers }
        };
        
        setMetricsHistory(newMetrics);
        
        // Only send growth notification once per session and only if there's an actual change
        if (!notificationSentRef.current && prevMetricsRef.current) {
          const previousTotal = prevMetricsRef.current.properties.current;
          
          // Check if properties have significantly increased (20%+ growth) since last update
          if (totalProperties > previousTotal && 
              totalProperties > prevMetricsRef.current.properties.current * 1.2) {
            
            notifications.addNotification(
              'Significant Growth',
              `Properties under management increased by ${Math.round((totalProperties/prevMetricsRef.current.properties.current - 1) * 100)}% compared to last period`,
              { type: 'success', showToast: true }
            );
            
            // Mark that we've sent a notification
            notificationSentRef.current = true;
            
            // Reset notification flag after 1 hour to allow future notifications
            setTimeout(() => {
              notificationSentRef.current = false;
            }, 3600000); // 1 hour
          }
        }
        
        // Update our reference to current metrics
        prevMetricsRef.current = newMetrics;
        
      } catch (error) {
        console.error('Error loading metrics history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistoricalMetrics();
    
    // Subscribe to real-time updates of metrics
    const unsubscribe = api.subscribeToAdminUpdates((data) => {
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED' || data.type === 'USER_CREATED') {
        loadHistoricalMetrics();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [notifications]);
  
  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 100; // If previous was 0, show 100% increase
    return Math.round(((current - previous) / previous) * 100);
  };
  
  // Get properties metrics
  const propertiesChange = calculateChange(
    metricsHistory.properties.current,
    metricsHistory.properties.previous
  );
  
  // Get evaluations metrics
  const evaluationsChange = calculateChange(
    metricsHistory.evaluations.current,
    metricsHistory.evaluations.previous
  );
  
  // Get revenue metrics
  const revenueChange = calculateChange(
    metricsHistory.revenue.current,
    metricsHistory.revenue.previous
  );
  
  // Get users metrics
  const usersChange = calculateChange(
    metricsHistory.users.current,
    metricsHistory.users.previous
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <h2 className="text-3xl font-bold">{metricsHistory.properties.current}</h2>
              </div>
            </div>
            <div>
              <Badge variant="outline" className={`${propertiesChange >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} flex items-center gap-1`}>
                {propertiesChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>{Math.abs(propertiesChange)}%</span>
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Last period: {metricsHistory.properties.previous}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Number of Evaluations</p>
                <h2 className="text-3xl font-bold">{metricsHistory.evaluations.current}</h2>
              </div>
            </div>
            <div>
              <Badge variant="outline" className={`${evaluationsChange >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} flex items-center gap-1`}>
                {evaluationsChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>{Math.abs(evaluationsChange)}%</span>
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Last period: {metricsHistory.evaluations.previous}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
                <CircleDollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h2 className="text-3xl font-bold">${metricsHistory.revenue.current.toLocaleString()}</h2>
              </div>
            </div>
            <div>
              <Badge variant="outline" className={`${revenueChange >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} flex items-center gap-1`}>
                {revenueChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>{Math.abs(revenueChange)}%</span>
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Last period: ${metricsHistory.revenue.previous.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h2 className="text-3xl font-bold">{metricsHistory.users.current}</h2>
              </div>
            </div>
            <div>
              <Badge variant="outline" className={`${usersChange >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} flex items-center gap-1`}>
                {usersChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>{Math.abs(usersChange)}%</span>
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Last period: {metricsHistory.users.previous}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetricsCards;
