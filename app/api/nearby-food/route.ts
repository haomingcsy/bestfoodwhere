import { NextRequest, NextResponse } from "next/server";
import { fetchAllBrandsWithLocationsSupabase } from "@/lib/supabase-menu";
import {
  calculateDistance,
  geocodeLocationName,
  geocodePostalCode,
} from "@/lib/geocoding";
import type {
  Coordinates,
  NearbyRestaurant,
  NearbyFoodError,
} from "@/types/nearby-food";

const DEFAULT_RADIUS_KM = 10;
const MAX_RADIUS_KM = 50;
const MAX_RESULTS = 50;

async function parseUserLocation(
  searchParams: URLSearchParams,
): Promise<
  | { success: true; location: Coordinates }
  | { success: false; error: NearbyFoodError; status: number }
> {
  const postalCode = searchParams.get("postalCode");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { success: true, location: { lat, lng } };
    }
  }

  if (postalCode) {
    if (!/^\d{6}$/.test(postalCode)) {
      return {
        success: false,
        error: {
          error:
            "Invalid postal code format. Please enter a 6-digit Singapore postal code.",
          code: "INVALID_POSTAL_CODE",
        },
        status: 400,
      };
    }

    const location = await geocodePostalCode(postalCode);
    if (!location) {
      return {
        success: false,
        error: {
          error: "Could not find location for the given postal code.",
          code: "GEOCODING_FAILED",
        },
        status: 400,
      };
    }

    return { success: true, location };
  }

  return {
    success: false,
    error: {
      error: "Please provide either a postal code or lat/lng coordinates.",
      code: "INVALID_POSTAL_CODE",
    },
    status: 400,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse and validate user location
  const locationResult = await parseUserLocation(searchParams);
  if (!locationResult.success) {
    return NextResponse.json(locationResult.error, {
      status: locationResult.status,
    });
  }
  const userLocation = locationResult.location;

  // Parse radius parameter
  const radiusParam = searchParams.get("radius");
  let radius = DEFAULT_RADIUS_KM;
  if (radiusParam) {
    const parsedRadius = parseFloat(radiusParam);
    if (!isNaN(parsedRadius) && parsedRadius > 0) {
      radius = Math.min(parsedRadius, MAX_RADIUS_KM);
    }
  }

  try {
    // Fetch all brands from Supabase
    const brands = await fetchAllBrandsWithLocationsSupabase();

    // Collect all unique location names first
    const uniqueLocations = new Set<string>();
    for (const brand of brands) {
      for (const location of brand.locations) {
        uniqueLocations.add(location.name);
      }
    }

    // Batch geocode all locations in parallel (much faster than sequential)
    const locationCoordsMap = new Map<string, Coordinates>();
    await Promise.all(
      Array.from(uniqueLocations).map(async (locationName) => {
        const coords = await geocodeLocationName(locationName);
        if (coords) {
          locationCoordsMap.set(locationName, coords);
        }
      }),
    );

    // Build nearby restaurants list using cached coordinates
    const nearbyRestaurants: NearbyRestaurant[] = [];

    for (const brand of brands) {
      for (const location of brand.locations) {
        // Use pre-fetched coordinates from cache
        const locationCoords = locationCoordsMap.get(location.name);
        if (!locationCoords) {
          continue;
        }

        // Calculate distance
        const distance = calculateDistance(userLocation, locationCoords);

        // Skip if outside radius
        if (distance > radius) {
          continue;
        }

        // Count menu items with images
        const menuItemCount = brand.menu.reduce((count, category) => {
          return count + category.items.filter((item) => item.imageUrl).length;
        }, 0);

        // Get first menu item image as restaurant image, or use location image
        const firstMenuImage = brand.menu
          .flatMap((cat) => cat.items)
          .find((item) => item.imageUrl)?.imageUrl;
        const imageUrl = location.imageUrl || firstMenuImage || "";

        nearbyRestaurants.push({
          brandName: brand.name,
          brandSlug: brand.slug,
          locationName: location.name,
          locationSlug: location.slug,
          imageUrl,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          address: location.address,
          rating: location.reviews.rating,
          reviewCount: location.reviews.count,
          cuisine: location.cuisine,
          diningStyle: location.diningStyle,
          priceRange: location.priceRange,
          menuItemCount,
        });
      }
    }

    // Sort by distance
    nearbyRestaurants.sort((a, b) => a.distance - b.distance);

    if (nearbyRestaurants.length === 0) {
      return NextResponse.json(
        {
          error: `No restaurants found within ${radius}km of your location.`,
          code: "NO_RESULTS",
        } satisfies NearbyFoodError,
        { status: 404 },
      );
    }

    // Limit results to prevent excessive response size
    const limitedRestaurants = nearbyRestaurants.slice(0, MAX_RESULTS);

    return NextResponse.json({
      restaurants: limitedRestaurants,
      userLocation,
      radius,
      total: nearbyRestaurants.length,
      hasMore: nearbyRestaurants.length > MAX_RESULTS,
    });
  } catch (error) {
    console.error("Error fetching nearby food:", error);
    return NextResponse.json(
      {
        error: "An error occurred while searching for nearby food.",
        code: "SERVER_ERROR",
      } satisfies NearbyFoodError,
      { status: 500 },
    );
  }
}
