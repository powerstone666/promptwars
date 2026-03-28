import { analyzeIncident } from "./incident-analyzer";

jest.mock("./ai-provider", () => ({
  callLLM: jest.fn(),
}));

const { callLLM } = jest.requireMock("./ai-provider") as {
  callLLM: jest.Mock;
};

describe("incident-analyzer", () => {
  beforeEach(() => {
    callLLM.mockReset();
  });

  it("returns safe fallback after provider failures", async () => {
    callLLM.mockRejectedValue(new Error("provider failed"));

    const result = await analyzeIncident(
      "my mother fainted and has chest pain",
      "req_test_fallback",
    );

    expect(result.incidentType).toBe("Unclassified Emergency");
    expect(result.severity).toBe("high");
    expect(result.escalation.shouldCallEmergency).toBe(true);
  });

  it("returns safe fallback after invalid JSON responses", async () => {
    callLLM.mockResolvedValue("not-json");

    const result = await analyzeIncident(
      "someone is not breathing",
      "req_test_invalid_json",
    );

    expect(result.incidentType).toBe("Unclassified Emergency");
    expect(result.verification.status).toBe("needs_confirmation");
  });
});
