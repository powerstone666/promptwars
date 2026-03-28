/**
 * Typed environment variable access.
 * Server-only vars are only readable inside API routes / server components.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

/* ── Server-only (never exposed to client) ── */

export function getLiteLLMBaseUrl(): string {
  return requireEnv("LITELLM_BASE_URL");
}

export function getLiteLLMApiKey(): string {
  return requireEnv("LITELLM_API_KEY");
}

export function getModelName(): string {
  return optionalEnv("MODEL_NAME", "gpt-4o-mini");
}

export function getDashScopeApiKey(): string {
  return requireEnv("DASHSCOPE_API_KEY");
}

export function getDashScopeCompatApiUrl(): string {
  return requireEnv("DASHSCOPE_COMPAT_API_URL");
}

export function getDashScopeVoiceModel(): string {
  return optionalEnv("DASHSCOPE_VOICE_MODEL", "qwen3-omni-flash");
}

export function getFirebaseProjectId(): string {
  return optionalEnv(
    "FIREBASE_PROJECT_ID",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  );
}

/* ── Public (safe to read anywhere) ── */

export function getAppName(): string {
  return optionalEnv("APP_NAME", "rakshak ai");
}

export function getMaxInputChars(): number {
  return Number(optionalEnv("MAX_INPUT_CHARS", "4000"));
}
