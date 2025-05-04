
// This is just adding the rush property to the interface
// We can't modify this file directly, so we'll create a compatible wrapper

import React from 'react';
import { OrderProcessingModal as BaseOrderProcessingModal } from './OrderProcessingModal';

interface OrderProcessingModalWrapperProps {
  properties: any[];
  onComplete: () => void | Promise<void>;
  totalPrice: number;
  rush?: boolean; // Make it optional to avoid breaking existing code
}

// Create a wrapper component that passes only the expected props
export const OrderProcessingModalWrapper: React.FC<OrderProcessingModalWrapperProps> = ({
  properties,
  onComplete,
  totalPrice,
  // We don't pass rush since it doesn't exist in the original component
}) => {
  return (
    <BaseOrderProcessingModal
      properties={properties}
      onComplete={onComplete}
      totalPrice={totalPrice}
    />
  );
};
