
export type CityPricing = {
  name: string;
  basePrice: number;
};

export type ProximityZone = 'A' | 'B' | 'C' | 'D';

export type PricingOptions = {
  rushBooking: boolean;
  surgeActive: boolean;
};

// Admin configurable city-based pricing
export const cityPricing: Record<string, CityPricing> = {
  kamloops: { name: 'Kamloops', basePrice: 18 },
  vancouver: { name: 'Vancouver', basePrice: 28 },
  toronto: { name: 'Toronto', basePrice: 30 },
};

// Distance tier fees
export const proximityFees: Record<ProximityZone, number> = {
  A: 0,  // 0-5 km
  B: 3,  // 5-10 km
  C: 6,  // 10-15 km
  D: 9,  // >15 km
};

export const proximityZoneDescriptions: Record<ProximityZone, string> = {
  A: '0-5 km',
  B: '5-10 km',
  C: '10-15 km',
  D: '>15 km',
};

// Constants
export const RUSH_FEE = 7;
export const SURGE_FEE = 5;
export const BULK_DISCOUNT_THRESHOLD = 4;
export const BULK_DISCOUNT_PERCENTAGE = 0.10; // 10%

// Helper function to calculate proximity fee
export const getProximityFee = (zone: ProximityZone): number => {
  return proximityFees[zone] || 0;
};

// Helper function to calculate price for a single property
export const calculatePropertyPrice = (
  city: string, 
  proximityZone: ProximityZone,
  options: PricingOptions
): { 
  basePrice: number; 
  proximityFee: number; 
  rushFee: number; 
  total: number;
} => {
  const selectedCity = cityPricing[city.toLowerCase()] || cityPricing.vancouver;
  const basePrice = selectedCity.basePrice;
  const proximityFee = getProximityFee(proximityZone);
  const rushFee = options.rushBooking ? RUSH_FEE : 0;
  
  return {
    basePrice,
    proximityFee,
    rushFee,
    total: basePrice + proximityFee + rushFee
  };
};

// Calculate total price for all properties
export const calculateTotalPrice = (
  propertyPrices: { basePrice: number; proximityFee: number; rushFee: number; total: number }[],
  options: PricingOptions
): {
  subtotal: number;
  discount: number;
  surgeFee: number;
  total: number;
} => {
  const subtotal = propertyPrices.reduce((sum, prop) => sum + prop.total, 0);
  
  // Apply bulk discount if eligible
  const isEligibleForBulkDiscount = propertyPrices.length >= BULK_DISCOUNT_THRESHOLD;
  const discount = isEligibleForBulkDiscount ? subtotal * BULK_DISCOUNT_PERCENTAGE : 0;
  
  // Apply surge fee if active (per session, not per property)
  const surgeFee = options.surgeActive ? SURGE_FEE : 0;
  
  const total = subtotal - discount + surgeFee;
  
  return {
    subtotal,
    discount,
    surgeFee,
    total
  };
};
