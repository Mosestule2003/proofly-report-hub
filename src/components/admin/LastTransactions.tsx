
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Order } from '@/services/api';

interface LastTransactionsProps {
  transactions: Order[];
  onViewTransaction: (orderId: string) => void;
  className?: string; // Added className prop as optional
}

const LastTransactions: React.FC<LastTransactionsProps> = ({ 
  transactions,
  onViewTransaction,
  className = '' // Added default empty string
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Evaluator Assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Report Ready': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <Card className={`col-span-2 ${className}`}> // Use the className prop here
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Last Transactions</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Order #{transaction.id.substring(0, 8)}</span>
                  <Badge className={`${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {format(new Date(transaction.createdAt), 'MMM dd, yyyy')} • {transaction.properties.length} properties
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">${transaction.totalPrice}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onViewTransaction(transaction.id)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LastTransactions;
