
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const SalesChart = () => {
  const [data, setData] = useState<any[]>([]);
  const { user } = useAuth();
  
  // Fetch real-time sales data
  useEffect(() => {
    const loadSalesData = async () => {
      try {
        // If we have a user and they're an admin, load the sales data
        if (user?.role === 'admin') {
          const salesData = await api.getSalesData();
          // Sort by date to ensure chronological order
          setData(salesData);
        }
      } catch (error) {
        console.error('Error loading sales data:', error);
      }
    };
    
    loadSalesData();
    
    // Subscribe to real-time sales updates
    const unsubscribe = api.subscribeToSalesUpdates((updatedData) => {
      setData(updatedData);
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Report Sales</CardTitle>
        <div className="text-sm text-muted-foreground">
          Real-time data
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis 
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <CartesianGrid vertical={false} stroke="#f5f5f5" />
            <Tooltip
              formatter={(value: number) => [`$${value}`, 'Revenue']}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Bar 
              dataKey="amount" 
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
