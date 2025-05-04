
import React from 'react';
import { OrderProcessingModal } from './OrderProcessingModal';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

interface OrderProcessingModalWrapperProps {
  properties: any[];
  onComplete: () => void | Promise<void>;
  totalPrice: number;
  rush?: boolean;
  orderDetails?: {
    id: string;
    createdAt: string;
    status?: string;
  };
}

export const OrderProcessingModalWrapper: React.FC<OrderProcessingModalWrapperProps> = ({
  properties,
  onComplete,
  totalPrice,
  rush,
  orderDetails
}) => {
  // Get status badge color
  const getStatusColor = (status: string = 'Pending') => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Evaluator Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Report Ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Optional Order Header Info */}
      {orderDetails && (
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">
              Order #{orderDetails.id.substring(0, 8)}
            </h3>
            <p className="text-sm text-muted-foreground">
              Created on {format(new Date(orderDetails.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          {orderDetails.status && (
            <Badge className={getStatusColor(orderDetails.status)}>
              {orderDetails.status}
            </Badge>
          )}
        </div>
      )}
      
      <OrderProcessingModal
        properties={properties}
        onComplete={onComplete}
        totalPrice={totalPrice}
        rush={rush}
      />
    </div>
  );
};
