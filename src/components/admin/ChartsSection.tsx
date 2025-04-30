
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartsSectionProps {
  barData?: { name: string; value: number }[];
  pieData?: { name: string; value: number; color: string }[];
  className?: string;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  barData = [
    { name: 'Mon', value: 2200 },
    { name: 'Tue', value: 2800 },
    { name: 'Wed', value: 3000 },
    { name: 'Thu', value: 4000 },
    { name: 'Fri', value: 2800 },
    { name: 'Sat', value: 2600 },
    { name: 'Sun', value: 2500 },
  ],
  pieData = [
    { name: 'Maintenance', value: 2500, color: '#9eceac' },
    { name: 'Repair', value: 1000, color: '#e6d9ac' },
    { name: 'Taxes', value: 800, color: '#afc4e6' },
    { name: 'Saving', value: 450, color: '#bfadd3' },
  ],
  className
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Report Sales</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-muted">Weekday</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value}`, 'Value']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#9b87f5" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">See Details</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value}`, 'Value']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    padding: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-2xl font-bold">${pieData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;
