/**
 * Geo Utility Functions
 * Contains functions for distance calculations and delivery fee computations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Calculate delivery fee based on distance
 * @param distanceKm Distance in kilometers
 * @param baseCharge Base charge for first 5km
 * @param extraRatePerKm Charge per km after 5km
 * @returns Total delivery fee
 */
export function calculateDeliveryFee(
  distanceKm: number,
  baseCharge: number,
  extraRatePerKm: number
): number {
  if (distanceKm <= 5) {
    return baseCharge
  }
  
  const extraDistance = distanceKm - 5
  const totalFee = baseCharge + extraDistance * extraRatePerKm
  
  return Math.round(totalFee * 100) / 100 // Round to 2 decimal places
}

/**
 * Validate if coordinates are within Sri Lanka bounds
 * @param lat Latitude
 * @param lng Longitude
 * @returns true if within bounds, false otherwise
 */
export function isWithinSriLankaBounds(lat: number, lng: number): boolean {
  return lat >= 5.9 && lat <= 9.8 && lng >= 79.5 && lng <= 81.9
}

/**
 * Check if a point is within radius of a city center
 * @param pointLat Latitude of point to check
 * @param pointLng Longitude of point to check
 * @param centerLat Latitude of city center
 * @param centerLng Longitude of city center
 * @param radiusKm Radius in kilometers (default 15)
 * @returns true if within radius, false otherwise
 */
export function isWithinCityRadius(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  radiusKm: number = 15
): boolean {
  const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng)
  return distance <= radiusKm
}
