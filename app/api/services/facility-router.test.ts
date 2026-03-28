import {
  findNearbyFacilities,
  getFacilitySearchConfig,
} from "./facility-router";

describe("facility-router", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  it("returns the right place types for medical incidents", () => {
    expect(getFacilitySearchConfig("medical", "high")).toEqual({
      includedTypes: ["hospital", "doctor", "pharmacy"],
      radiusMeters: 5000,
    });
  });

  it("promotes police and hospitals for critical incidents", () => {
    expect(getFacilitySearchConfig("utility", "critical")).toEqual({
      includedTypes: ["hospital", "police", "fire_station"],
      radiusMeters: 10000,
    });
  });

  it("throws when the Google Maps API key is missing", async () => {
    await expect(
      findNearbyFacilities({
        latitude: 17.385,
        longitude: 78.4867,
        incidentType: "medical",
      }),
    ).rejects.toThrow("Missing GOOGLE_MAPS_API_KEY.");
  });

  it("calls Places Nearby Search and maps the response", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "AIza-test-key";

    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          places: [
            {
              id: "place-1",
              displayName: { text: "City Hospital" },
              formattedAddress: "1 Health Ave",
              primaryType: "hospital",
              location: { latitude: 17.4, longitude: 78.4 },
              googleMapsUri: "https://maps.google.com/?cid=place-1",
            },
          ],
        }),
      } as Response);

    const facilities = await findNearbyFacilities({
      latitude: 17.385,
      longitude: 78.4867,
      incidentType: "medical",
      severity: "critical",
      maxResultCount: 1,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchNearby",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Goog-Api-Key": "AIza-test-key",
        }),
      }),
    );
    expect(facilities).toEqual([
      {
        id: "place-1",
        name: "City Hospital",
        address: "1 Health Ave",
        primaryType: "hospital",
        latitude: 17.4,
        longitude: 78.4,
        googleMapsUri: "https://maps.google.com/?cid=place-1",
      },
    ]);
  });

  it("surfaces Google Places API errors", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "AIza-test-key";

    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "forbidden",
    } as Response);

    await expect(
      findNearbyFacilities({
        latitude: 17.385,
        longitude: 78.4867,
        incidentType: "road",
      }),
    ).rejects.toThrow("Google Places Nearby Search failed with 403: forbidden");
  });
});
