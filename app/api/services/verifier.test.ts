import { verifyAnalysis } from "./verifier";
import type { AnalyzeResponse } from "./types";

function createAnalysis(overrides: Partial<AnalyzeResponse> = {}): AnalyzeResponse {
  return {
    incidentType: "Medical Emergency",
    severity: "medium",
    confidence: 0.9,
    language: "en",
    summary: "Possible issue that needs attention.",
    extractedSignals: ["pain", "sweating"],
    immediateActions: ["Stay calm"],
    avoidActions: ["Do not panic"],
    escalation: {
      shouldCallEmergency: false,
      recommendedService: null,
    },
    routing: {
      facilityType: "hospital",
      rationale: "Best fit",
    },
    verification: {
      status: "verified",
      notes: [],
    },
    disclaimer: "short",
    ...overrides,
  };
}

describe("verifyAnalysis", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
  });

  it("upgrades severity to critical when critical keywords appear", () => {
    const result = verifyAnalysis(
      createAnalysis({ severity: "medium" }),
      "The patient has chest pain and is not breathing",
      "req-1",
    );

    expect(result.severity).toBe("critical");
    expect(result.verification.notes).toContain(
      "Severity upgraded: critical-level keywords detected in input",
    );
    expect(result.escalation.shouldCallEmergency).toBe(true);
  });

  it("reduces confidence when the extracted signals are weak", () => {
    const result = verifyAnalysis(
      createAnalysis({
        confidence: 0.95,
        extractedSignals: ["pain"],
      }),
      "pain",
      "req-2",
    );

    expect(result.confidence).toBe(0.5);
    expect(result.verification.notes).toContain(
      "Confidence reduced: few signals extracted from input",
    );
  });

  it("flags unsafe diagnostic language and replaces weak disclaimers", () => {
    const result = verifyAnalysis(
      createAnalysis({
        summary: "You definitely have a confirmed diagnosis.",
        disclaimer: "too short",
      }),
      "person fainted and fell",
      "req-3",
    );

    expect(result.verification.status).toBe("needs_confirmation");
    expect(result.verification.notes).toContain(
      "Flagged: AI output contained potentially unsafe diagnostic language",
    );
    expect(result.disclaimer).toContain("AI-generated triage assessment");
  });
});
