
import React from 'react';
import { OrderProcessingModal } from './OrderProcessingModal';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';

interface OrderProcessingModalWrapperProps {
  properties: any[];
  onComplete: () => void | Promise<void>;
  totalPrice: number;
  rush?: boolean;
  orderDetails?: {
    id: string;
    createdAt: string;
    status?: string;
    agentContact?: {
      name: string;
      email: string;
      phone?: string;
    };
    userId?: string;
    notes?: string;
  };
  isAdminView?: boolean;
}

export const OrderProcessingModalWrapper: React.FC<OrderProcessingModalWrapperProps> = ({
  properties,
  onComplete,
  totalPrice,
  rush,
  orderDetails,
  isAdminView = false
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
      {/* Order Header Info */}
      {orderDetails && (
        <div className="mb-6">
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
          
          {/* Extended details for admin view */}
          {isAdminView && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderDetails.agentContact && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Agent Contact</h4>
                      <p className="text-sm">{orderDetails.agentContact.name}</p>
                      <p className="text-sm text-muted-foreground">{orderDetails.agentContact.email}</p>
                      {orderDetails.agentContact.phone && (
                        <p className="text-sm text-muted-foreground">{orderDetails.agentContact.phone}</p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Order Details</h4>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Total Price:</span> ${totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Properties:</span> {properties.length}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Rush Order:</span> {rush ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                
                {orderDetails.notes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium text-sm mb-2">Notes</h4>
                      <p className="text-sm whitespace-pre-wrap">{orderDetails.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
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
