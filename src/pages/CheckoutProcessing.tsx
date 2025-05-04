
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { OrderProcessingModalWrapper } from '@/components/OrderProcessingModalWrapper';

const CheckoutProcessing: React.FC = () => {
  const { cart, totalPrice, clearCart, isRushBooking } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/dashboard');
    }
  }, [cart, navigate]);

  const handleComplete = () => {
    // Transition to success page with query params
    const orderId = `ORD-${Date.now().toString().slice(-8)}`;
    const searchParams = new URLSearchParams();
    searchParams.append('total', totalPrice.toString());
    
    navigate(`/checkout/success/${orderId}?${searchParams.toString()}`);
    
    // Clear the cart after successful checkout
    clearCart();
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-64px)]">
      <OrderProcessingModalWrapper
        properties={cart}
        onComplete={handleComplete}
        totalPrice={totalPrice}
      />
    </div>
  );
};

export default CheckoutProcessing;
