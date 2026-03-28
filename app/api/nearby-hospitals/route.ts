/**
 * GET /api/nearby-hospitals
 *
 * Uses Google Maps Places API (New) to find nearby hospitals.
 * Query params: lat, lng, radius (optional, default 5000m)
 */

import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface NearbyHospital {
  name: string;
  address: string;
  phone: string | null;
  rating: number | null;
  isOpen: boolean | null;
  distance: string | null;
  lat: number;
  lng: number;
  placeId: string;
  mapsUrl: string;
}

/**
 * Calculate approximate distance between two coordinates (Haversine formula).
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseInt(searchParams.get("radius") ?? "5000", 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng query parameters" },
      { status: 400 },
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 },
    );
  }

  try {
    // Use Places API (Nearby Search)
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(Math.min(radius, 50000)));
    url.searchParams.set("type", "hospital");
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[nearby-hospitals] Places API error:", data.status, data.error_message);
      return NextResponse.json(
        { error: `Places API error: ${data.status}` },
        { status: 502 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = data.results ?? [];

    // For each result, try to get phone number via Place Details
    const hospitals: NearbyHospital[] = await Promise.all(
      results.slice(0, 8).map(async (place) => {
        const placeLat = place.geometry?.location?.lat;
        const placeLng = place.geometry?.location?.lng;
        const distKm =
          placeLat && placeLng ? haversineKm(lat, lng, placeLat, placeLng) : null;

        // Get phone number from Place Details
        let phone: string | null = null;
        try {
          const detailUrl = new URL(
            "https://maps.googleapis.com/maps/api/place/details/json",
          );
          detailUrl.searchParams.set("place_id", place.place_id);
          detailUrl.searchParams.set("fields", "formatted_phone_number,international_phone_number");
          detailUrl.searchParams.set("key", GOOGLE_MAPS_API_KEY);

          const detailRes = await fetch(detailUrl.toString());
          const detailData = await detailRes.json();
          phone =
            detailData.result?.international_phone_number ??
            detailData.result?.formatted_phone_number ??
            null;
        } catch {
          // Ignore — phone is optional
        }

        return {
          name: place.name ?? "Unknown Hospital",
          address: place.vicinity ?? place.formatted_address ?? "",
          phone,
          rating: place.rating ?? null,
          isOpen: place.opening_hours?.open_now ?? null,
          distance: distKm !== null ? `${distKm.toFixed(1)} km` : null,
          lat: placeLat ?? 0,
          lng: placeLng ?? 0,
          placeId: place.place_id ?? "",
          mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        };
      }),
    );

    // Sort by distance
    hospitals.sort((a, b) => {
      const da = parseFloat(a.distance ?? "999");
      const db = parseFloat(b.distance ?? "999");
      return da - db;
    });

    return NextResponse.json({ hospitals });
  } catch (err) {
    console.error("[nearby-hospitals] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch nearby hospitals" },
      { status: 500 },
    );
  }
}
