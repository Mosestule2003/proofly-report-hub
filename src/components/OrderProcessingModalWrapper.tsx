
import React from 'react';
import { OrderProcessingModal } from './OrderProcessingModal';

interface OrderProcessingModalWrapperProps {
  properties: any[];
  onComplete: () => void | Promise<void>;
  totalPrice: number;
  rush?: boolean;
}

// Create a wrapper component that includes the rush property
export const OrderProcessingModalWrapper: React.FC<OrderProcessingModalWrapperProps> = ({
  properties,
  onComplete,
  totalPrice,
  rush
}) => {
  return (
    <OrderProcessingModal
      properties={properties}
      onComplete={onComplete}
      totalPrice={totalPrice}
      rush={rush}
    />
  );
};
