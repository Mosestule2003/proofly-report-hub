
/**
 * Calculates the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  // Earth's radius in kilometers
  const R = 6371;
  
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Get the distance surcharge based on distance
 * @param distance Distance in kilometers
 * @returns Surcharge amount in USD
 */
export const getDistanceSurcharge = (distance: number): number => {
  if (distance > 30) return 15;
  if (distance > 15) return 10;
  if (distance > 5) return 5;
  return 0;
};

/**
 * Get a descriptive text for the distance range
 * @param distance Distance in kilometers
 * @returns Text description of distance range
 */
export const getDistanceRangeText = (distance: number): string => {
  if (distance > 30) return "30+ km";
  if (distance > 15) return "15-30 km";
  if (distance > 5) return "5-15 km";
  return "0-5 km";
};
