// Service de calcul de livraison
// Basé sur les zones de livraison et la distance

export interface DeliveryZone {
  name: string;
  price: number;
  maxDistance?: number; // en km
}

// Zones de livraison avec prix fixes
export const DELIVERY_ZONES: Record<string, DeliveryZone> = {
  // Dakar et banlieue
  'Dakar': { name: 'Dakar', price: 1500 },
  'Almadies': { name: 'Almadies', price: 1500 },
  'Grand Dakar': { name: 'Grand Dakar', price: 1500 },
  'Parcelles Assainies': { name: 'Parcelles Assainies', price: 1500 },
  'Dakar Plateau': { name: 'Dakar Plateau', price: 1500 },
  'Pikine': { name: 'Pikine', price: 2000 },
  'Guédiawaye': { name: 'Guédiawaye', price: 2000 },
  'Rufisque': { name: 'Rufisque', price: 2500 },
  
  // Autres régions
  'Thiès': { name: 'Thiès', price: 3000 },
  'Saint-Louis': { name: 'Saint-Louis', price: 5000 },
  'Kaolack': { name: 'Kaolack', price: 4500 },
  'Ziguinchor': { name: 'Ziguinchor', price: 7000 },
  'Tambacounda': { name: 'Tambacounda', price: 6000 },
  'Kolda': { name: 'Kolda', price: 6500 },
  'Kédougou': { name: 'Kédougou', price: 7500 },
  'Matam': { name: 'Matam', price: 5500 },
  'Louga': { name: 'Louga', price: 4000 },
  'Fatick': { name: 'Fatick', price: 3500 },
  'Kaffrine': { name: 'Kaffrine', price: 4000 },
  'Sédhiou': { name: 'Sédhiou', price: 6500 },
  'Diourbel': { name: 'Diourbel', price: 3500 },
};

/**
 * Calculer le prix de livraison basé sur la zone
 */
export function calculateDeliveryPrice(zone: string): number {
  const zoneData = DELIVERY_ZONES[zone];
  if (!zoneData) {
    // Zone inconnue, prix par défaut
    return 3000;
  }
  return zoneData.price;
}

/**
 * Calculer le prix basé sur la distance (formule simplifiée)
 * @param distanceKm Distance en kilomètres
 * @returns Prix en FCFA
 */
export function calculatePriceByDistance(distanceKm: number): number {
  const basePrice = 1000; // Prix de base
  const pricePerKm = 100; // Prix par km
  
  return Math.round(basePrice + (distanceKm * pricePerKm));
}

/**
 * Estimer la durée de livraison
 * @param distanceKm Distance en kilomètres
 * @returns Durée en minutes
 */
export function estimateDeliveryTime(distanceKm: number): number {
  const avgSpeed = 30; // Vitesse moyenne en km/h (trafic urbain)
  const preparationTime = 15; // Temps de préparation en minutes
  
  const travelTime = (distanceKm / avgSpeed) * 60; // en minutes
  return Math.round(preparationTime + travelTime);
}

/**
 * Formater le prix pour affichage
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

/**
 * Formater la durée pour affichage
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

/**
 * Obtenir toutes les zones disponibles
 */
export function getAvailableZones(): Array<{ value: string; label: string; price: number }> {
  return Object.entries(DELIVERY_ZONES).map(([key, zone]) => ({
    value: key,
    label: zone.name,
    price: zone.price,
  }));
}

/**
 * Calculer la distance entre deux points (formule de Haversine)
 * @returns Distance en kilomètres
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
