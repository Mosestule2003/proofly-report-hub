
import React, { createContext, useContext, useState } from 'react';
import { AgentContact } from '@/services/api';
import { calculateDistance } from '@/utils/distanceCalculator';
import { 
  ProximityZone, 
  calculatePropertyPrice, 
  calculateTotalPrice,
  PricingOptions
} from '@/utils/pricingUtils';

export interface Property {
  id: string;
  address: string;
  description: string;
  price: number;
  city?: string;
  proximityZone?: ProximityZone;
  agentContact?: AgentContact;
  landlordInfo: LandlordInfo;
  coordinates?: {
    lat: number;
    lng: number;
  };
  pricing?: {
    basePrice: number;
    proximityFee: number;
    rushFee: number;
    total: number;
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
  pricingOptions: PricingOptions;
  addProperty: (property: Property) => void;
  removeProperty: (propertyId: string) => void;
  updatePropertyLandlord: (propertyId: string, landlordInfo: LandlordInfo) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getDiscount: () => number;
  getSurgeFee: () => number;
  getRushFeesTotal: () => number;
  getBaseFeesTotal: () => number;
  getProximityFeesTotal: () => number;
  toggleRushBooking: () => void;
  isRushBooking: () => boolean;
  isSurgeActive: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [pricingOptions, setPricingOptions] = useState<PricingOptions>({
    rushBooking: false,
    surgeActive: false // This would be controlled by admin in a real app
  });
  
  const addProperty = (property: Property) => {
    // Generate an ID if not provided
    if (!property.id) {
      property.id = crypto.randomUUID();
    }
    
    // Calculate pricing for this property
    const propertyPrice = calculatePropertyPrice(
      property.city || 'vancouver',
      property.proximityZone || 'A',
      pricingOptions
    );
    
    // Create the property with pricing details
    const propertyWithPricing = {
      ...property,
      pricing: propertyPrice,
      price: propertyPrice.total
    };
    
    // Validate that landlord info is present
    if (!propertyWithPricing.landlordInfo || !propertyWithPricing.landlordInfo.name || 
        !propertyWithPricing.landlordInfo.phone) {
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
  
  const getBaseFeesTotal = (): number => {
    return properties.reduce((total, prop) => total + (prop.pricing?.basePrice || 0), 0);
  };
  
  const getProximityFeesTotal = (): number => {
    return properties.reduce((total, prop) => total + (prop.pricing?.proximityFee || 0), 0);
  };
  
  const getRushFeesTotal = (): number => {
    if (!pricingOptions.rushBooking) return 0;
    return properties.reduce((total, prop) => total + (prop.pricing?.rushFee || 0), 0);
  };
  
  const getSurgeFee = (): number => {
    return pricingOptions.surgeActive ? 5 : 0; // Constant surge fee per session
  };
  
  const getDiscount = (): number => {
    if (properties.length < 4) return 0; // No discount unless 4+ properties
    
    // Calculate subtotal before discount
    const subtotal = properties.reduce((total, prop) => {
      const basePrice = prop.pricing?.basePrice || 0;
      const proximityFee = prop.pricing?.proximityFee || 0;
      const rushFee = prop.pricing?.rushFee || 0;
      return total + basePrice + proximityFee + rushFee;
    }, 0);
    
    return subtotal * 0.1; // 10% discount
  };
  
  const getTotalPrice = (): number => {
    // Get individual property prices
    const propertyPrices = properties.map(prop => ({
      basePrice: prop.pricing?.basePrice || 0,
      proximityFee: prop.pricing?.proximityFee || 0,
      rushFee: pricingOptions.rushBooking ? (prop.pricing?.rushFee || 0) : 0,
      total: (prop.pricing?.basePrice || 0) + 
             (prop.pricing?.proximityFee || 0) +
             (pricingOptions.rushBooking ? (prop.pricing?.rushFee || 0) : 0)
    }));
    
    // Calculate total with discount and surge fee
    const priceDetails = calculateTotalPrice(propertyPrices, pricingOptions);
    
    return priceDetails.total;
  };
  
  const toggleRushBooking = () => {
    setPricingOptions(prev => ({
      ...prev,
      rushBooking: !prev.rushBooking
    }));
    
    // Update property pricing when rush booking changes
    updatePropertyPricing();
  };
  
  const updatePropertyPricing = () => {
    const updatedProperties = properties.map(property => {
      const propertyPrice = calculatePropertyPrice(
        property.city || 'vancouver',
        property.proximityZone || 'A',
        pricingOptions
      );
      
      return {
        ...property,
        pricing: propertyPrice,
        price: propertyPrice.total
      };
    });
    
    setProperties(updatedProperties);
  };
  
  const isRushBooking = () => pricingOptions.rushBooking;
  const isSurgeActive = () => pricingOptions.surgeActive;
  
  const value = {
    properties,
    pricingOptions,
    addProperty,
    removeProperty,
    updatePropertyLandlord,
    clearCart,
    getTotalPrice,
    getDiscount,
    getSurgeFee,
    getRushFeesTotal,
    getBaseFeesTotal,
    getProximityFeesTotal,
    toggleRushBooking,
    isRushBooking,
    isSurgeActive
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
