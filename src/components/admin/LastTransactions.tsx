
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, CircleDollarSign, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Order } from '@/services/api';

interface LastTransactionsProps {
  transactions: Order[];
  onViewTransaction: (id: string) => void;
  className?: string;
}

const LastTransactions: React.FC<LastTransactionsProps> = ({ 
  transactions, 
  onViewTransaction,
  className 
}) => {
  // Get the 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
    
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CircleDollarSign className="h-4 w-4" /> Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onViewTransaction(transaction.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        ID: {transaction.id.substring(0, 8)}...
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {transaction.properties[0].address}
                      {transaction.properties.length > 1 && 
                        ` and ${transaction.properties.length - 1} more`
                      }
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${transaction.totalPrice}</div>
                    <div className={cn(
                      "text-xs mt-1 px-1.5 py-0.5 rounded",
                      transaction.status === 'Report Ready' 
                        ? "bg-green-100 text-green-700" 
                        : transaction.status === 'In Progress'
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                    )}>
                      {transaction.status}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-2" />
                </div>
              ))}
            </div>
          )}
          <div className="text-center">
            <a href="#" className="text-xs text-primary hover:underline">View All Transactions</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LastTransactions;
