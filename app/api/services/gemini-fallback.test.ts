import { callLLM } from "./ai-provider";

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

describe("gemini fallback", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("uses Gemini fallback for text/image requests after primary provider timeout", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new DOMException("The operation was aborted.", "AbortError"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: "{\"incidentType\":\"Medical Emergency\",\"severity\":\"high\",\"confidence\":0.7,\"language\":\"en\",\"summary\":\"Fallback worked.\",\"extractedSignals\":[\"chest pain\"],\"immediateActions\":[\"Call emergency services\"],\"avoidActions\":[\"Do not delay\"],\"escalation\":{\"shouldCallEmergency\":true,\"recommendedService\":\"Ambulance\"},\"routing\":{\"facilityType\":\"Hospital Emergency Room\",\"rationale\":\"Needs urgent evaluation\"},\"verification\":{\"status\":\"needs_confirmation\",\"notes\":[\"Gemini fallback used\"]},\"disclaimer\":\"This is an AI-generated triage assessment, not a medical or professional diagnosis.\"}",
                  },
                ],
              },
            },
          ],
        }),
      } as Response);

    const result = await callLLM(
      "system prompt",
      "user prompt",
      "req_google_text_fallback",
      "data:image/png;base64,dGVzdA==",
    );

    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-goog-api-key": "gemini-fallback-key",
        }),
        body: expect.stringContaining("\"inline_data\""),
      }),
    );
    expect(result).toContain("\"incidentType\":\"Medical Emergency\"");
  });

  it("uses Gemini fallback for audio requests after the voice provider fails", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "voice provider down",
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: "{\"incidentType\":\"Medical Emergency\",\"severity\":\"high\",\"confidence\":0.7,\"language\":\"en\",\"summary\":\"Audio fallback worked.\",\"extractedSignals\":[\"fainting\"],\"immediateActions\":[\"Call emergency services\"],\"avoidActions\":[\"Do not delay\"],\"escalation\":{\"shouldCallEmergency\":true,\"recommendedService\":\"Ambulance\"},\"routing\":{\"facilityType\":\"Hospital Emergency Room\",\"rationale\":\"Needs urgent evaluation\"},\"verification\":{\"status\":\"needs_confirmation\",\"notes\":[\"Gemini audio fallback used\"]},\"disclaimer\":\"This is an AI-generated triage assessment, not a medical or professional diagnosis.\"}",
                  },
                ],
              },
            },
          ],
        }),
      } as Response);

    const result = await callLLM(
      "system prompt",
      "voice user prompt",
      "req_google_audio_fallback",
      undefined,
      "data:audio/webm;codecs=opus;base64,dGVzdA==",
    );

    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-goog-api-key": "gemini-fallback-key",
        }),
        body: expect.stringContaining("\"mime_type\":\"audio/webm\""),
      }),
    );
    expect(result).toContain("\"incidentType\":\"Medical Emergency\"");
  });
});
