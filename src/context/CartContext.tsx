
import React, { createContext, useContext, useState } from 'react';
import { AgentContact } from '@/services/api';

export interface Property {
  id?: string;
  address: string;
  description: string;
  price?: number;
  agentContact?: AgentContact;
}

interface CartContextType {
  properties: Property[];
  addProperty: (property: Property) => void;
  removeProperty: (index: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  
  const addProperty = (property: Property) => {
    // Generate an ID if not provided
    if (!property.id) {
      property.id = crypto.randomUUID();
    }
    
    // Set default price if not provided
    if (!property.price) {
      property.price = 30; // Default price
    }
    
    setProperties([...properties, property]);
  };
  
  const removeProperty = (index: number) => {
    const updatedProperties = [...properties];
    updatedProperties.splice(index, 1);
    setProperties(updatedProperties);
  };
  
  const clearCart = () => {
    setProperties([]);
  };
  
  const value = {
    properties,
    addProperty,
    removeProperty,
    clearCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};
