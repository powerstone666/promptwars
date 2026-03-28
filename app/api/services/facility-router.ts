const GOOGLE_PLACES_NEARBY_URL =
  "https://places.googleapis.com/v1/places:searchNearby";
const GOOGLE_PLACES_FIELD_MASK =
  "places.displayName,places.formattedAddress,places.id,places.location,places.googleMapsUri,places.primaryType";

export type IncidentType =
  | "medical"
  | "fire"
  | "crime"
  | "disaster"
  | "utility"
  | "road"
  | "shelter"
  | "general";

export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type GoogleMapsPlaceType =
  | "hospital"
  | "pharmacy"
  | "police"
  | "fire_station"
  | "doctor";

export interface FacilitySearchInput {
  latitude: number;
  longitude: number;
  incidentType: IncidentType;
  severity?: SeverityLevel;
  radiusMeters?: number;
  maxResultCount?: number;
  languageCode?: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  address: string;
  primaryType?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUri?: string;
}

interface GooglePlaceSearchResult {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  primaryType?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  googleMapsUri?: string;
}

interface GooglePlacesNearbyResponse {
  places?: GooglePlaceSearchResult[];
}

const INCIDENT_TYPE_MAP: Record<
  IncidentType,
  {
    includedTypes: GoogleMapsPlaceType[];
    defaultRadiusMeters: number;
  }
> = {
  medical: {
    includedTypes: ["hospital", "doctor", "pharmacy"],
    defaultRadiusMeters: 5000,
  },
  fire: {
    includedTypes: ["fire_station", "hospital", "police"],
    defaultRadiusMeters: 8000,
  },
  crime: {
    includedTypes: ["police", "hospital"],
    defaultRadiusMeters: 8000,
  },
  disaster: {
    includedTypes: ["hospital", "fire_station", "police"],
    defaultRadiusMeters: 12000,
  },
  utility: {
    includedTypes: ["police", "fire_station"],
    defaultRadiusMeters: 10000,
  },
  road: {
    includedTypes: ["hospital", "police", "fire_station"],
    defaultRadiusMeters: 10000,
  },
  shelter: {
    includedTypes: ["police", "hospital"],
    defaultRadiusMeters: 15000,
  },
  general: {
    includedTypes: ["hospital", "police"],
    defaultRadiusMeters: 7000,
  },
};

const CRITICAL_SEVERITY_TYPES: GoogleMapsPlaceType[] = ["hospital", "police"];

export function getFacilitySearchConfig(
  incidentType: IncidentType,
  severity: SeverityLevel = "medium",
): {
  includedTypes: GoogleMapsPlaceType[];
  radiusMeters: number;
} {
  const baseConfig = INCIDENT_TYPE_MAP[incidentType] ?? INCIDENT_TYPE_MAP.general;
  const includedTypes = [...baseConfig.includedTypes];

  if (severity === "critical") {
    for (const type of CRITICAL_SEVERITY_TYPES) {
      if (!includedTypes.includes(type)) {
        includedTypes.unshift(type);
      }
    }
  }

  return {
    includedTypes,
    radiusMeters: baseConfig.defaultRadiusMeters,
  };
}

function getGoogleMapsApiKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY.");
  }

  return apiKey;
}

export async function findNearbyFacilities(
  input: FacilitySearchInput,
): Promise<NearbyFacility[]> {
  const { incidentType, severity = "medium" } = input;
  const config = getFacilitySearchConfig(incidentType, severity);
  const radiusMeters = input.radiusMeters ?? config.radiusMeters;
  const maxResultCount = input.maxResultCount ?? 5;

  const response = await fetch(GOOGLE_PLACES_NEARBY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getGoogleMapsApiKey(),
      "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: config.includedTypes,
      maxResultCount,
      rankPreference: "DISTANCE",
      languageCode: input.languageCode ?? "en",
      locationRestriction: {
        circle: {
          center: {
            latitude: input.latitude,
            longitude: input.longitude,
          },
          radius: radiusMeters,
        },
      },
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Google Places Nearby Search failed with ${response.status}: ${responseText}`,
    );
  }

  const data = (await response.json()) as GooglePlacesNearbyResponse;

  return (data.places ?? []).map((place) => ({
    id: place.id ?? "",
    name: place.displayName?.text ?? "Unknown place",
    address: place.formattedAddress ?? "Address unavailable",
    primaryType: place.primaryType,
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    googleMapsUri: place.googleMapsUri,
  }));
}
