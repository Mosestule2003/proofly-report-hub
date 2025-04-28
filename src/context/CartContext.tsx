
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type Property = {
  id: string;
  address: string;
  description: string;
  price: number;
};

type CartContextType = {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'price'>) => void;
  removeProperty: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getDiscount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const BASE_PRICE = 30; // Base price for evaluation in dollars

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    // Load from localStorage if available
    const savedCart = localStorage.getItem('proofly-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to localStorage whenever properties change
  useEffect(() => {
    localStorage.setItem('proofly-cart', JSON.stringify(properties));
  }, [properties]);

  const addProperty = (property: Omit<Property, 'id' | 'price'>) => {
    // Check if property already exists with similar address
    const alreadyExists = properties.some(
      p => p.address.toLowerCase() === property.address.toLowerCase()
    );

    if (alreadyExists) {
      toast.warning("This property is already in your cart.");
      return;
    }

    // For now, use base price. In a real app, we'd calculate based on distance
    const newProperty = {
      ...property,
      id: crypto.randomUUID(),
      price: BASE_PRICE,
    };

    setProperties(prev => [...prev, newProperty]);
    toast.success("Property added to cart!");
  };

  const removeProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    toast.info("Property removed from cart");
  };

  const clearCart = () => {
    setProperties([]);
  };

  // Calculate total price with discount
  const getTotalPrice = () => {
    const subtotal = properties.reduce((total, property) => total + property.price, 0);
    return subtotal - getDiscount();
  };

  // Calculate discount (15% if more than 5 properties)
  const getDiscount = () => {
    const subtotal = properties.reduce((total, property) => total + property.price, 0);
    return properties.length > 5 ? subtotal * 0.15 : 0;
  };

  return (
    <CartContext.Provider value={{ 
      properties, 
      addProperty, 
      removeProperty, 
      clearCart, 
      getTotalPrice, 
      getDiscount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
