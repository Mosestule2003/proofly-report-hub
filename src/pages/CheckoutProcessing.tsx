
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Property } from '@/context/CartContext';
import OrderProcessingModal from '@/components/OrderProcessingModal';

const CheckoutProcessing: React.FC = () => {
  const navigate = useNavigate();
  const { properties, getTotalPrice, clearCart, isRushBooking } = useCart();

  // Handle processing completion
  const handleProcessingComplete = () => {
    // Generate a random order ID for demo purposes
    const demoOrderId = crypto.randomUUID();
    
    // After the order processing is complete, we can clear the cart
    // since the properties have been "processed"
    clearCart();
    
    navigate(`/checkout/success/${demoOrderId}`);
  };

  useEffect(() => {
    // If no properties in cart, redirect to home
    if (properties.length === 0) {
      navigate('/');
    }
  }, [properties, navigate]);

  return (
    <OrderProcessingModal
      properties={properties}
      onComplete={handleProcessingComplete}
      totalPrice={getTotalPrice()}
      rush={isRushBooking()}
    />
  );
};

export default CheckoutProcessing;
