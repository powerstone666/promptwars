import { composeActions } from "./action-composer";
import type { AnalyzeResponse } from "./types";

function createAnalysis(overrides: Partial<AnalyzeResponse> = {}): AnalyzeResponse {
  return {
    incidentType: "Medical Emergency",
    severity: "high",
    confidence: 0.8,
    language: "en",
    summary: "Person fainted and needs help.",
    extractedSignals: ["fainted", "sweating"],
    immediateActions: ["Keep the affected person comfortable and still"],
    avoidActions: [],
    escalation: {
      shouldCallEmergency: false,
      recommendedService: null,
    },
    routing: {
      facilityType: "hospital",
      rationale: "Nearest emergency support",
    },
    verification: {
      status: "needs_confirmation",
      notes: [],
    },
    disclaimer: "AI-generated guidance.",
    ...overrides,
  };
}

describe("composeActions", () => {
  it("adds severity-specific actions without duplicating existing ones", () => {
    const result = composeActions(createAnalysis());

    expect(result.immediateActions).toContain(
      "Call emergency services or go to the nearest emergency room",
    );
    expect(result.immediateActions.filter((item) => item === "Keep the affected person comfortable and still")).toHaveLength(1);
  });

  it("adds incident-specific avoid actions for known incident types", () => {
    const result = composeActions(createAnalysis());

    expect(result.avoidActions).toContain(
      "Do not attempt to diagnose the condition yourself",
    );
    expect(result.avoidActions).toContain(
      "Do not move the person if a spinal injury is suspected",
    );
  });

  it("falls back to generic avoid actions for unknown incident types", () => {
    const result = composeActions(
      createAnalysis({
        incidentType: "Unknown Situation",
      }),
    );

    expect(result.avoidActions).toContain(
      "Do not attempt to handle the situation alone if it appears dangerous",
    );
    expect(result.avoidActions).toContain(
      "Do not ignore professional advice from emergency responders",
    );
  });
});
