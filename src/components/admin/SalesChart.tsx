
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

// Generate sample daily data for the current month
const generateDailyData = () => {
  const data = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    // Only include days up to today
    if (day <= now.getDate()) {
      data.push({
        name: `${day}`,
        amount: Math.floor(Math.random() * 500) + 100,
      });
    }
  }
  
  return data;
};

const SalesChart = () => {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    setData(generateDailyData());
  }, []);
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Report Sales</CardTitle>
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
