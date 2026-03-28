import { findNearbyFacilities } from "./facility-router";

describe("google maps services", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.GOOGLE_MAPS_API_KEY = "AIza-test-key";
  });

  afterEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  it("sends the expected Google Places field mask and default language", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ places: [] }),
    } as Response);

    await findNearbyFacilities({
      latitude: 12.97,
      longitude: 77.59,
      incidentType: "medical",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchNearby",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Goog-Api-Key": "AIza-test-key",
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.id,places.location,places.googleMapsUri,places.primaryType",
        }),
        body: JSON.stringify({
          includedTypes: ["hospital", "doctor", "pharmacy"],
          maxResultCount: 5,
          rankPreference: "DISTANCE",
          languageCode: "en",
          locationRestriction: {
            circle: {
              center: {
                latitude: 12.97,
                longitude: 77.59,
              },
              radius: 5000,
            },
          },
        }),
      }),
    );
  });

  it("forwards custom Google Maps search controls", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ places: [] }),
    } as Response);

    await findNearbyFacilities({
      latitude: 12.97,
      longitude: 77.59,
      incidentType: "road",
      severity: "critical",
      radiusMeters: 1500,
      maxResultCount: 2,
      languageCode: "hi",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchNearby",
      expect.objectContaining({
        body: JSON.stringify({
          includedTypes: ["hospital", "police", "fire_station"],
          maxResultCount: 2,
          rankPreference: "DISTANCE",
          languageCode: "hi",
          locationRestriction: {
            circle: {
              center: {
                latitude: 12.97,
                longitude: 77.59,
              },
              radius: 1500,
            },
          },
        }),
      }),
    );
  });

  it("maps empty Google Places responses to an empty facility list", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await expect(
      findNearbyFacilities({
        latitude: 12.97,
        longitude: 77.59,
        incidentType: "general",
      }),
    ).resolves.toEqual([]);
  });
});
