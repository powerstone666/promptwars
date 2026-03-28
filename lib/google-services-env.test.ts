import {
  getFirebaseProjectId,
  getGeminiApiKey,
  getGeminiFallbackModel,
} from "./env";

describe("google services env helpers", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns the configured Gemini API key when present", () => {
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: "gemini-key",
    };

    expect(getGeminiApiKey()).toBe("gemini-key");
  });

  it("returns null when the Gemini API key is absent", () => {
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;

    expect(getGeminiApiKey()).toBeNull();
  });

  it("uses the configured Gemini fallback model when present", () => {
    process.env = {
      ...originalEnv,
      GEMINI_FALLBACK_MODEL: "gemini-2.5-pro",
    };

    expect(getGeminiFallbackModel()).toBe("gemini-2.5-pro");
  });

  it("falls back to the default Gemini model when not configured", () => {
    process.env = { ...originalEnv };
    delete process.env.GEMINI_FALLBACK_MODEL;

    expect(getGeminiFallbackModel()).toBe("gemini-2.5-flash");
  });

  it("prefers FIREBASE_PROJECT_ID over NEXT_PUBLIC_FIREBASE_PROJECT_ID", () => {
    process.env = {
      ...originalEnv,
      FIREBASE_PROJECT_ID: "server-project",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "public-project",
    };

    expect(getFirebaseProjectId()).toBe("server-project");
  });

  it("falls back to NEXT_PUBLIC_FIREBASE_PROJECT_ID when FIREBASE_PROJECT_ID is absent", () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "public-project",
    };
    delete process.env.FIREBASE_PROJECT_ID;

    expect(getFirebaseProjectId()).toBe("public-project");
  });
});
