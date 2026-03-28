import { parseAudioDataUrl } from "./ai-provider";

describe("ai-provider audio parsing", () => {
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
});
