
import React, { createContext, useContext, useState } from 'react';
import { AgentContact } from '@/services/api';

export interface Property {
  id: string;
  address: string;
  description: string;
  price: number;
  agentContact?: AgentContact;
  landlordInfo?: LandlordInfo;
}

export interface LandlordInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
}

interface CartContextType {
  properties: Property[];
  addProperty: (property: Property) => void;
  removeProperty: (propertyId: string) => void;
  updatePropertyLandlord: (propertyId: string, landlordInfo: LandlordInfo) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getDiscount: () => number;
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
  
  const removeProperty = (propertyId: string) => {
    const updatedProperties = properties.filter(prop => prop.id !== propertyId);
    setProperties(updatedProperties);
  };
  
  const updatePropertyLandlord = (propertyId: string, landlordInfo: LandlordInfo) => {
    const updatedProperties = properties.map(prop => 
      prop.id === propertyId ? { ...prop, landlordInfo } : prop
    );
    setProperties(updatedProperties);
  };
  
  const clearCart = () => {
    setProperties([]);
  };
  
  const getTotalPrice = (): number => {
    const subtotal = properties.reduce((total, prop) => total + prop.price, 0);
    return properties.length >= 5 ? subtotal * 0.85 : subtotal; // 15% discount for 5+ properties
  };
  
  const getDiscount = (): number => {
    const subtotal = properties.reduce((total, prop) => total + prop.price, 0);
    return properties.length >= 5 ? subtotal * 0.15 : 0; // 15% discount for 5+ properties
  };
  
  const value = {
    properties,
    addProperty,
    removeProperty,
    updatePropertyLandlord,
    clearCart,
    getTotalPrice,
    getDiscount
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
