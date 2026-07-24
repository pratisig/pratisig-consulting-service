// Service de géocodage utilisant Nominatim (OpenStreetMap)
// Documentation: https://nominatim.org/release-docs/develop/api/Overview/

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Convertir une adresse en coordonnées GPS
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=sn`,
      {
        headers: {
          'User-Agent': 'PratisigConsultingService/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error('Erreur de géocodage:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
      address: data[0].address
    };
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
}

/**
 * Convertir des coordonnées GPS en adresse (reverse geocoding)
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PratisigConsultingService/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error('Erreur de géocodage inverse:', response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      display_name: data.display_name,
      address: data.address
    };
  } catch (error) {
    console.error('Erreur de géocodage inverse:', error);
    return null;
  }
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

/**
 * Formater une adresse à partir des données de géocodage
 */
export function formatAddress(result: GeocodingResult): string {
  const parts = [];
  
  if (result.address.road) parts.push(result.address.road);
  if (result.address.suburb) parts.push(result.address.suburb);
  if (result.address.village || result.address.town || result.address.city) {
    parts.push(result.address.village || result.address.town || result.address.city);
  }
  if (result.address.state) parts.push(result.address.state);
  
  return parts.join(', ');
}
