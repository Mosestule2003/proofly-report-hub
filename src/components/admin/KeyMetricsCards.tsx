
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, BarChart3, CircleDollarSign, ArrowUp, ArrowDown } from 'lucide-react';

// Define the Order interface to match with what we're using
interface Order {
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
}

interface KeyMetricsCardsProps {
  orders: Order[];
}

const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({ orders = [] }) => {
  // Ensure safe calculations even if properties is undefined
  const totalProperties = orders.reduce((acc, order) => 
    acc + (Array.isArray(order.properties) ? order.properties.length : 0), 0);
  
  // Use totalPrice if available, fallback to amount
  const totalRevenue = orders.reduce((acc, order) => 
    acc + (typeof order.totalPrice === 'number' ? order.totalPrice : 
           typeof order.amount === 'number' ? order.amount : 0), 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <h2 className="text-3xl font-bold">{totalProperties}</h2>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <span>20%</span>
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Last month: {Math.floor(totalProperties * 0.8)}</p>
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
                <h2 className="text-3xl font-bold">{orders.length}</h2>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                <ArrowDown className="h-3 w-3" />
                <span>10%</span>
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Last month: {Math.floor(orders.length * 1.1)}</p>
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
                <h2 className="text-3xl font-bold">${totalRevenue.toLocaleString()}</h2>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <span>15%</span>
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Last month: ${Math.floor(totalRevenue * 0.85).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetricsCards;
