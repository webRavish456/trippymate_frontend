/**
 * Geocode an address using OpenStreetMap Nominatim (free, no API key).
 * Returns { lat, lng } or null if not found.
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || !address.trim()) return null;
  const query = encodeURIComponent(address.trim() + ', India');
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'TrippyMates/1.0' } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].lat != null && data[0].lon != null) {
      return { lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.warn('Geocode error:', e);
  }
  return null;
}

/**
 * Haversine distance between two points in km.
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const RADIUS_KM = 150;

/**
 * Check if destination is within radius (default 150 km) of captain's location.
 * captainLocation e.g. "Jaipur, Rajasthan", destination e.g. "Shimla".
 * Returns { within, message, distanceKm }.
 */
export async function checkDestinationWithinRadius(
  captainLocation,
  destination,
  radiusKm = RADIUS_KM
) {
  if (!captainLocation || !destination) {
    return {
      within: false,
      message: 'Captain location and destination are required.',
      distanceKm: null
    };
  }

  const captainCoords = await geocodeAddress(captainLocation);
  if (!captainCoords) {
    return {
      within: true,
      message: null,
      distanceKm: null
    };
  }

  const destCoords = await geocodeAddress(destination);
  if (!destCoords) {
    return {
      within: false,
      message: 'Could not find the destination. Please enter a valid city or area name (e.g. within ' + captainLocation + ' or nearby).',
      distanceKm: null
    };
  }

  const distanceKm = getDistanceKm(
    captainCoords.lat,
    captainCoords.lng,
    destCoords.lat,
    destCoords.lng
  );

  if (distanceKm > radiusKm) {
    return {
      within: false,
      message: `This captain operates only within ${radiusKm} km of ${captainLocation}. Your destination is about ${Math.round(distanceKm)} km away. Please choose a destination near ${captainLocation}.`,
      distanceKm
    };
  }

  return { within: true, message: null, distanceKm };
}
