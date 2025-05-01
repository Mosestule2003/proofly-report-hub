import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { api } from '@/services/api';
import { useNotificationsContext } from '@/context/NotificationsContext';

interface CostData {
  name: string;
  value: number;
}

// Define the Order interface to match API data
interface Order {
  id: string;
  totalPrice: number;
  // Add other required properties
  status: string;
  userId: string;
  properties: any[];
  discount: number;
  createdAt: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CostBreakdown: React.FC = () => {
  const [data, setData] = useState<CostData[]>([
    { name: 'Evaluator Payouts', value: 45 },
    { name: 'Software Ops', value: 20 },
    { name: 'Server Cost', value: 15 },
    { name: 'Savings', value: 20 },
  ]);
  const { notifications } = useNotificationsContext();
  
  // Track if we've already sent notifications to prevent duplicates
  const savingsNotificationSentRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Attempt to load real cost breakdown data from API
    const loadCostData = async () => {
      try {
        // Check if we have real cost data from the API
        const orders = await api.getOrders();
        if (orders && orders.length > 0) {
          // Calculate evaluator payouts (60% of total revenue)
          const totalRevenue = orders.reduce((sum, order) => {
            return sum + order.totalPrice;
          }, 0);
          
          const evaluatorPayouts = Math.round((totalRevenue * 0.6) / totalRevenue * 100);
          const softwareOps = Math.round((totalRevenue * 0.2) / totalRevenue * 100);
          const serverCost = Math.round((totalRevenue * 0.1) / totalRevenue * 100);
          const savings = Math.round((totalRevenue * 0.1) / totalRevenue * 100);
          
          const newData = [
            { name: 'Evaluator Payouts', value: evaluatorPayouts },
            { name: 'Software Ops', value: softwareOps },
            { name: 'Server Cost', value: serverCost },
            { name: 'Savings', value: savings },
          ];
          
          setData(newData);
          
          // Only send savings alert notification once and if revenue is substantial
          if (!savingsNotificationSentRef.current && savings < 15 && totalRevenue > 1000) {
            notifications.addNotification(
              'Cost Alert',
              'Savings percentage has dropped below 15% of revenue',
              { type: 'warning', showToast: true }
            );
            
            // Mark that we've sent this notification
            savingsNotificationSentRef.current = true;
            
            // Reset notification flag after 24 hours
            setTimeout(() => {
              savingsNotificationSentRef.current = false;
            }, 86400000); // 24 hours
          }
        }
      } catch (error) {
        console.error('Error loading cost data:', error);
        // Keep default data if there's an error
      }
    };
    
    loadCostData();
    
    // Subscribe to updates that might affect costs
    const unsubscribe = api.subscribeToAdminUpdates((data) => {
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED') {
        loadCostData();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [notifications]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              onClick={(entry) => {
                // Make cost breakdown items interactive
                window.location.href = `/admin/finances/${entry.name.toLowerCase().replace(' ', '-')}`;
              }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;
