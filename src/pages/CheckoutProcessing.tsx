
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Property } from '@/context/CartContext';
import OrderProcessingModal from '@/components/OrderProcessingModal';

const CheckoutProcessing: React.FC = () => {
  const navigate = useNavigate();
  const { properties } = useCart();

  // Handle processing completion
  const handleProcessingComplete = () => {
    // Generate a random order ID for demo purposes
    const demoOrderId = crypto.randomUUID();
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
    />
  );
};

export default CheckoutProcessing;
