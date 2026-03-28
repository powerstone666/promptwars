import { test, expect } from "@playwright/test";

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
      facilityType: "hospital",
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

test.describe("emergency page", () => {
  test("allows selecting a demo scenario and submitting for analysis", async ({
    page,
  }) => {
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockedAnalysisResponse),
      });
    });

    await page.goto("/emergency");

    await expect(
      page.getByRole("heading", { name: /decode the chaos/i }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: /demo: medical panic/i })
      .click();

    const input = page.getByLabel(/emergency situation description/i);
    await expect(input).toHaveValue(/chest pain|sweating|fainted/i);

    await page.getByRole("button", { name: /analyze emergency situation/i }).click();

    await expect(
      page.getByRole("article", { name: /emergency triage result/i }),
    ).toBeVisible();
    await expect(page.getByText(/medical emergency/i)).toBeVisible();
    await expect(page.getByText(/call emergency services immediately/i)).toBeVisible();
    await expect(page.getByText(/suggested facility: hospital/i)).toBeVisible();
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

    await page.goto("/emergency");

    const input = page.getByLabel(/emergency situation description/i);
    await input.fill("my mother fainted and has chest pain");

    await page.getByRole("button", { name: /analyze emergency situation/i }).click();

    await expect(page.getByText(/analysis failed\. please try again\./i)).toBeVisible();
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  });
});
