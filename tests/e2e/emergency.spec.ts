import { expect, test } from "@playwright/test";

const mockedAnalysisResponse = {
  success: true,
  requestId: "req_test_123",
  processedAt: "2026-03-28T12:00:00.000Z",
  data: {
    incidentType: "Medical Emergency",
    severity: "critical",
    confidence: 0.93,
    language: "en",
    summary:
      "The reported symptoms suggest a high-risk medical emergency requiring urgent attention.",
    extractedSignals: ["chest pain", "sweating", "fainted"],
    immediateActions: [
      "Call emergency services IMMEDIATELY (911/112/108)",
      "Keep the person lying down if safe to do so",
    ],
    avoidActions: [
      "Do not leave the affected person alone",
      "Do not give food or water if the person is unresponsive",
    ],
    escalation: {
      shouldCallEmergency: true,
      recommendedService: "Local Emergency Services (911/112/108)",
    },
    routing: {
      facilityType: "Hospital Emergency Room",
      rationale: "Nearest emergency-capable hospital is the safest destination.",
    },
    verification: {
      status: "needs_confirmation",
      notes: ["Severity upgraded: critical-level keywords detected in input"],
    },
    disclaimer:
      "This is an AI-generated triage assessment, not a medical or professional diagnosis.",
  },
};

const mockedWeatherResponse = {
  weather: {
    temperature: 29,
    feelsLike: 32,
    humidity: 64,
    windSpeed: 14,
    weatherDescription: "Partly cloudy",
    isDay: true,
  },
};

const mockedNearbyHospitalsResponse = {
  hospitals: [
    {
      name: "City General Hospital Emergency",
      address: "Whitefield Main Road, Bengaluru",
      phone: "+91 80 4000 0000",
      rating: 4.3,
      isOpen: true,
      distance: "2.1 km",
      lat: 12.98,
      lng: 77.7,
      placeId: "place-1",
      mapsUrl: "https://maps.google.com/?q=place_id:place-1",
      types: ["hospital"],
    },
  ],
};

test.describe("emergency triage ui", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition: (success: PositionCallback) => {
            success({
              coords: {
                latitude: 12.9849,
                longitude: 77.7019,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
                toJSON: () => ({}),
              },
              timestamp: Date.now(),
              toJSON: () => ({}),
            } as GeolocationPosition);
          },
        },
      });
    });
  });

  test("allows selecting a demo scenario and shows nearby context after analysis", async ({
    page,
  }) => {
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockedAnalysisResponse),
      });
    });

    await page.route("**/api/weather**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockedWeatherResponse),
      });
    });

    await page.route("**/api/nearby-hospitals**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockedNearbyHospitalsResponse),
      });
    });

    await page.goto("/");

    await page.getByRole("button", { name: /demo: medical panic/i }).click();

    const input = page.getByLabel(/emergency situation description/i);
    await expect(input).toHaveValue(/chest pain|sweating|fainted/i);

    await page.getByRole("button", { name: /analyze emergency situation/i }).click();

    await expect(
      page.getByRole("article", { name: /emergency triage result/i }),
    ).toBeVisible();
    await expect(page.getByText(/medical emergency/i)).toBeVisible();
    await expect(
      page.getByText(/call emergency services immediately/i),
    ).toBeVisible();
    await expect(
      page.getByText(/suggested facility: hospital emergency room/i),
    ).toBeVisible();
    await expect(
      page.getByText(/current conditions/i),
    ).toBeVisible();
    await expect(
      page.getByText(/nearby emergency-capable hospitals/i),
    ).toBeVisible();
    await expect(
      page.getByText(/city general hospital emergency/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /show verification details/i }),
    ).toBeVisible();
  });

  test("shows an error state when analysis fails", async ({ page }) => {
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Analysis failed. Please try again.",
        }),
      });
    });

    await page.goto("/");

    const input = page.getByLabel(/emergency situation description/i);
    await input.fill("my mother fainted and has chest pain");

    await page.getByRole("button", { name: /analyze emergency situation/i }).click();

    await expect(
      page.getByText(/analysis failed\. please try again\./i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  });

  test("covers voice and image affordances in the input panel", async ({ page }) => {
    await page.addInitScript(() => {
      class MockMediaRecorder {
        stream: MediaStream;
        mimeType = "audio/webm;codecs=opus";
        ondataavailable: ((event: BlobEvent) => void) | null = null;
        onstop: (() => void) | null = null;

        constructor(stream: MediaStream) {
          this.stream = stream;
        }

        start() {}

        stop() {
          this.ondataavailable?.({
            data: new Blob(["voice-note"], { type: "audio/webm" }),
          } as BlobEvent);
          this.onstop?.();
        }
      }

      Object.defineProperty(window, "MediaRecorder", {
        configurable: true,
        value: MockMediaRecorder,
      });

      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () =>
            ({
              getTracks: () => [{ stop: () => {} }],
            }) as unknown as MediaStream,
        },
      });
    });

    await page.goto("/");

    await expect(
      page.getByRole("button", { name: /upload an image of the emergency/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /record voice input/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /record voice input/i }).click();
    await expect(
      page.getByRole("button", { name: /stop voice recording/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /stop voice recording/i }).click();

    await expect(page.getByText(/voice note attached/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /delete recorded audio/i }),
    ).toBeVisible();
  });
});
