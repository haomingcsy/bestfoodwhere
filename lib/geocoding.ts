import type { Coordinates } from "@/types/nearby-food";

const EARTH_RADIUS_KM = 6371;

// In-memory cache for geocoding results
const geocodeCache = new Map<string, Coordinates>();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates,
): number {
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Geocodes a Singapore postal code to coordinates
 */
export async function geocodePostalCode(
  postalCode: string,
): Promise<Coordinates | null> {
  // Validate Singapore postal code format (6 digits)
  if (!/^\d{6}$/.test(postalCode)) {
    return null;
  }

  const cacheKey = `postal:${postalCode}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = requireEnv("GOOGLE_MAPS_API_KEY");
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", `Singapore ${postalCode}`);
  url.searchParams.set("components", "country:SG");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error(
      `Geocoding API error: ${response.status} ${response.statusText}`,
    );
    return null;
  }

  const data = (await response.json()) as {
    status: string;
    results?: { geometry?: { location?: { lat: number; lng: number } } }[];
  };

  if (data.status !== "OK" || !data.results?.[0]?.geometry?.location) {
    console.error(
      `Geocoding failed for postal code ${postalCode}:`,
      data.status,
    );
    return null;
  }

  const location = data.results[0].geometry.location;
  const coords: Coordinates = { lat: location.lat, lng: location.lng };

  geocodeCache.set(cacheKey, coords);
  return coords;
}

/**
 * Geocodes an address to coordinates
 */
export async function geocodeAddress(
  address: string,
): Promise<Coordinates | null> {
  if (!address.trim()) {
    return null;
  }

  const cacheKey = `address:${address.toLowerCase().trim()}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = requireEnv("GOOGLE_MAPS_API_KEY");
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");

  // Append Singapore if not already present
  const searchAddress = address.toLowerCase().includes("singapore")
    ? address
    : `${address}, Singapore`;

  url.searchParams.set("address", searchAddress);
  url.searchParams.set("components", "country:SG");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error(
      `Geocoding API error: ${response.status} ${response.statusText}`,
    );
    return null;
  }

  const data = (await response.json()) as {
    status: string;
    results?: { geometry?: { location?: { lat: number; lng: number } } }[];
  };

  if (data.status !== "OK" || !data.results?.[0]?.geometry?.location) {
    console.error(`Geocoding failed for address "${address}":`, data.status);
    return null;
  }

  const location = data.results[0].geometry.location;
  const coords: Coordinates = { lat: location.lat, lng: location.lng };

  geocodeCache.set(cacheKey, coords);
  return coords;
}

/**
 * Geocodes a location name (e.g., mall name) to coordinates
 */
export async function geocodeLocationName(
  locationName: string,
): Promise<Coordinates | null> {
  // Common Singapore malls with their approximate coordinates
  // This serves as a fallback when API calls fail
  const knownLocations: Record<string, Coordinates> = {
    "suntec-city": { lat: 1.2943, lng: 103.8577 },
    vivocity: { lat: 1.2644, lng: 103.8221 },
    "plaza-singapura": { lat: 1.3008, lng: 103.8451 },
    "junction-8": { lat: 1.3508, lng: 103.8488 },
    nex: { lat: 1.3506, lng: 103.8724 },
    "tampines-mall": { lat: 1.353, lng: 103.9453 },
    jewel: { lat: 1.3601, lng: 103.9893 },
    "velocity-novena-square": { lat: 1.3207, lng: 103.8436 },
    "united-square": { lat: 1.3277, lng: 103.8429 },
    "marina-bay-sands": { lat: 1.2838, lng: 103.8607 },
    imm: { lat: 1.3347, lng: 103.7466 },
    "ion-orchard": { lat: 1.304, lng: 103.8318 },
    "bugis-junction": { lat: 1.2997, lng: 103.8553 },
    "raffles-city": { lat: 1.2937, lng: 103.8526 },
    "the-shoppes-at-marina-bay-sands": { lat: 1.2838, lng: 103.8607 },
    westgate: { lat: 1.3345, lng: 103.7427 },
    jem: { lat: 1.3333, lng: 103.7428 },
    "great-world": { lat: 1.2893, lng: 103.831 },
    takashimaya: { lat: 1.3037, lng: 103.8325 },
    paragon: { lat: 1.304, lng: 103.8361 },
    "313somerset": { lat: 1.301, lng: 103.8383 },
  };

  const slug = locationName
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check known locations first
  if (knownLocations[slug]) {
    return knownLocations[slug];
  }

  // Fall back to geocoding API
  return geocodeAddress(locationName);
}

/**
 * Clears the geocoding cache
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}

/**
 * Gets the current cache size
 */
export function getGeoCacheSize(): number {
  return geocodeCache.size;
}
