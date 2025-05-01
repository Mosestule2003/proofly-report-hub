
import React, { createContext, useContext, useState } from 'react';
import { AgentContact } from '@/services/api';
import { calculateDistance } from '@/utils/distanceCalculator';

export interface Property {
  id: string;
  address: string;
  description: string;
  price: number;
  agentContact?: AgentContact;
  landlordInfo: LandlordInfo;
  coordinates?: {
    lat: number;
    lng: number;
  };
  pricing?: {
    baseFee: number;
    distanceSurcharge: number;
    weatherMultiplier: number;
    finalPrice: number;
  };
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
  getBaseFeeTotal: () => number;
  getDistanceSurchargeTotal: () => number;
  getWeatherSurchargeTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  
  const addProperty = (property: Property) => {
    // Generate an ID if not provided
    if (!property.id) {
      property.id = crypto.randomUUID();
    }
    
    // Calculate dynamic pricing
    const baseFee = 25; // Base fee is $25
    let distanceSurcharge = 0;
    const weatherMultiplier = property.pricing?.weatherMultiplier || 1.0; // Default to 1.0 if not provided
    
    // Calculate distance surcharge if there's at least one existing property
    if (properties.length > 0 && properties[0].coordinates && property.coordinates) {
      const firstProperty = properties[0];
      const distance = calculateDistance(
        firstProperty.coordinates.lat,
        firstProperty.coordinates.lng,
        property.coordinates.lat,
        property.coordinates.lng
      );
      
      // Apply distance surcharge based on kilometers
      if (distance > 30) {
        distanceSurcharge = 15;
      } else if (distance > 15) {
        distanceSurcharge = 10;
      } else if (distance > 5) {
        distanceSurcharge = 5;
      }
    }
    
    // Calculate final price for this property
    const finalPrice = (baseFee + distanceSurcharge) * weatherMultiplier;
    
    // Update the property with pricing details
    const propertyWithPricing = {
      ...property,
      pricing: {
        baseFee,
        distanceSurcharge,
        weatherMultiplier,
        finalPrice
      },
      price: finalPrice
    };
    
    // Validate that landlord info is present
    if (!propertyWithPricing.landlordInfo || !propertyWithPricing.landlordInfo.name || 
        !propertyWithPricing.landlordInfo.email || !propertyWithPricing.landlordInfo.phone) {
      console.error("Cannot add property without complete landlord information");
      return;
    }
    
    setProperties([...properties, propertyWithPricing]);
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
  
  const getBaseFeeTotal = (): number => {
    return properties.reduce((total, prop) => total + (prop.pricing?.baseFee || 25), 0);
  };
  
  const getDistanceSurchargeTotal = (): number => {
    return properties.reduce((total, prop) => total + (prop.pricing?.distanceSurcharge || 0), 0);
  };
  
  const getWeatherSurchargeTotal = (): number => {
    return properties.reduce((total, prop) => {
      const baseFee = prop.pricing?.baseFee || 25;
      const distanceSurcharge = prop.pricing?.distanceSurcharge || 0;
      const weatherMultiplier = prop.pricing?.weatherMultiplier || 1.0;
      return total + ((baseFee + distanceSurcharge) * (weatherMultiplier - 1));
    }, 0);
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
    getDiscount,
    getBaseFeeTotal,
    getDistanceSurchargeTotal,
    getWeatherSurchargeTotal
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
