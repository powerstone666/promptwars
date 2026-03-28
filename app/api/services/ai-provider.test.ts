import { callLLM, parseAudioDataUrl } from "./ai-provider";

jest.mock("@/lib/env", () => ({
  getDashScopeApiKey: jest.fn(() => "dashscope-key"),
  getDashScopeCompatApiUrl: jest.fn(
    () => "https://dashscope.example.com/compatible-mode/v1/chat/completions",
  ),
  getDashScopeVoiceModel: jest.fn(() => "gemini-voice-model"),
  getGeminiApiKey: jest.fn(() => "gemini-fallback-key"),
  getGeminiFallbackModel: jest.fn(() => "gemini-2.5-flash"),
  getLiteLLMBaseUrl: jest.fn(() => "https://litellm.example.com"),
  getLiteLLMApiKey: jest.fn(() => "litellm-key"),
  getModelName: jest.fn(() => "gemini-text-model"),
}));

describe("ai-provider audio parsing", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("accepts generic octet-stream recordings and treats them as webm audio", () => {
    const parsed = parseAudioDataUrl("data:application/octet-stream;base64,dGVzdA==");

    expect(parsed).toEqual({
      data: "dGVzdA==",
      format: "webm",
    });
  });

  it("accepts audio data URLs with codec parameters", () => {
    const parsed = parseAudioDataUrl("data:audio/webm;codecs=opus;base64,dGVzdA==");

    expect(parsed).toEqual({
      data: "dGVzdA==",
      format: "webm",
    });
  });

  it("accepts raw base64 audio payloads", () => {
    const parsed = parseAudioDataUrl("dGVzdA==");

    expect(parsed).toEqual({
      data: "dGVzdA==",
      format: "webm",
    });
  });

  it("routes audio requests to the Gemini voice endpoint", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: [
                { type: "text", text: "{\"incidentType\":\"Medical Emergency\",\"severity\":\"high\",\"confidence\":0.7,\"language\":\"en\",\"summary\":\"Possible emergency.\",\"extractedSignals\":[\"chest pain\"],\"immediateActions\":[\"Call emergency services\"],\"avoidActions\":[\"Do not delay\"],\"escalation\":{\"shouldCallEmergency\":true,\"recommendedService\":\"Ambulance\"},\"routing\":{\"facilityType\":\"Hospital Emergency Room\",\"rationale\":\"Needs urgent evaluation\"},\"verification\":{\"status\":\"needs_confirmation\",\"notes\":[\"Voice input reviewed\"]},\"disclaimer\":\"This is an AI-generated triage assessment, not a medical or professional diagnosis.\"}" },
              ],
            },
          },
        ],
      }),
    } as Response);

    await callLLM(
      "system",
      "user prompt",
      "req_voice_route",
      undefined,
      "data:audio/webm;codecs=opus;base64,dGVzdA==",
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://dashscope.example.com/compatible-mode/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("routes text and image requests to the Gemini text/image endpoint", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "{\"incidentType\":\"Medical Emergency\",\"severity\":\"high\",\"confidence\":0.7,\"language\":\"en\",\"summary\":\"Possible emergency requiring urgent care.\",\"extractedSignals\":[\"chest pain\"],\"immediateActions\":[\"Call emergency services\"],\"avoidActions\":[\"Do not delay\"],\"escalation\":{\"shouldCallEmergency\":true,\"recommendedService\":\"Ambulance\"},\"routing\":{\"facilityType\":\"Hospital Emergency Room\",\"rationale\":\"Needs urgent evaluation\"},\"verification\":{\"status\":\"needs_confirmation\",\"notes\":[\"Image reviewed\"]},\"disclaimer\":\"This is an AI-generated triage assessment, not a medical or professional diagnosis.\"}",
            },
          },
        ],
      }),
    } as Response);

    await callLLM(
      "system",
      "user prompt",
      "req_image_route",
      "data:image/png;base64,dGVzdA==",
      undefined,
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://litellm.example.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("falls back to Gemini when the text/image provider fails", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "provider down",
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: "{\"incidentType\":\"Medical Emergency\",\"severity\":\"high\",\"confidence\":0.7,\"language\":\"en\",\"summary\":\"Possible emergency requiring urgent care.\",\"extractedSignals\":[\"chest pain\"],\"immediateActions\":[\"Call emergency services\"],\"avoidActions\":[\"Do not delay\"],\"escalation\":{\"shouldCallEmergency\":true,\"recommendedService\":\"Ambulance\"},\"routing\":{\"facilityType\":\"Hospital Emergency Room\",\"rationale\":\"Needs urgent evaluation\"},\"verification\":{\"status\":\"needs_confirmation\",\"notes\":[\"Fallback used\"]},\"disclaimer\":\"This is an AI-generated triage assessment, not a medical or professional diagnosis.\"}",
                  },
                ],
              },
            },
          ],
        }),
      } as Response);

    const result = await callLLM(
      "system",
      "user prompt",
      "req_gemini_fallback",
      undefined,
      undefined,
    );

    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-goog-api-key": "gemini-fallback-key",
        }),
      }),
    );
    expect(result).toContain("\"incidentType\":\"Medical Emergency\"");
  });
});
