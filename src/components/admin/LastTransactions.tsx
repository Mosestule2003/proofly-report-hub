
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, CircleDollarSign, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { Transaction } from '@/services/api';

interface LastTransactionsProps {
  className?: string;
  transactions: Transaction[];
}

const LastTransactions: React.FC<LastTransactionsProps> = ({ className, transactions }) => {
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Helper function to safely format dates
  const safeFormatDate = (dateString: string, formatStr: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatStr) : 'Invalid date';
  };
    
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Latest Transactions</CardTitle>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground p-4">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-start rounded-md border p-3"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  transaction.status === 'completed' ? 'bg-green-100' : 
                  transaction.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  <CircleDollarSign className={`h-5 w-5 ${
                    transaction.status === 'completed' ? 'text-green-600' : 
                    transaction.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                  }`} />
                </div>
                
                <div className="ml-4 flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      ${transaction.amount.toFixed(2)}
                    </p>
                    <div className={`rounded-full px-2 py-0.5 text-xs ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-600' : 
                      transaction.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {transaction.description}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {safeFormatDate(transaction.date, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-2">
              <a href="#" className="text-xs text-primary hover:underline">View all transactions</a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LastTransactions;
