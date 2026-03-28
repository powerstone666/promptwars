/**
 * Incident Analyzer — converts messy input into structured emergency output.
 *
 * Composes prompts, calls AI, parses + validates with zod.
 * Returns typed AnalyzeResponse or safe fallback on failure.
 */

import type { AnalyzeResponse } from "./types";
import { analyzeResponseSchema } from "./schemas";
import { SYSTEM_PROMPT, buildUserPrompt, SAFE_FALLBACK } from "./prompts";
import { callLLM } from "./ai-provider";
import { AI_MAX_RETRIES } from "@/lib/constants";
import { Logger } from "./logger";

const logger = new Logger({
  minLevel: 0,
  format: "json",
  includeCaller: false,
});

/**
 * Attempt to parse JSON from LLM output.
 * Handles cases where the model wraps JSON in markdown code fences.
 */
function extractJSON(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  return cleaned.trim();
}

/**
 * Analyze messy real-world input and return structured emergency triage.
 */
export async function analyzeIncident(
  text: string,
  requestId: string,
  languageHint?: string,
  imageBase64?: string,
): Promise<AnalyzeResponse> {
  const userPrompt = buildUserPrompt(text, languageHint, !!imageBase64);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        logger.warn(`[${requestId}] Retry attempt ${attempt}/${AI_MAX_RETRIES}`);
      }

      const raw = await callLLM(SYSTEM_PROMPT, userPrompt, requestId, imageBase64);
      const cleaned = extractJSON(raw);

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        logger.error(`[${requestId}] JSON parse failed`, {
          error: parseErr instanceof Error ? parseErr.message : String(parseErr),
          rawPreview: cleaned.slice(0, 300),
        });
        throw new Error("LLM returned invalid JSON");
      }

      // Validate with zod
      const result = analyzeResponseSchema.safeParse(parsed);

      if (result.success) {
        logger.info(`[${requestId}] Analysis succeeded`, {
          incidentType: result.data.incidentType,
          severity: result.data.severity,
          confidence: result.data.confidence,
        });
        return result.data;
      }

      // Zod validation failed
      logger.error(`[${requestId}] Schema validation failed`, {
        issues: result.error.issues.slice(0, 5),
      });
      throw new Error(`Schema validation failed: ${result.error.issues.map((i) => i.message).join(", ")}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      logger.error(`[${requestId}] Analysis attempt ${attempt} failed`, {
        error: lastError.message,
      });
    }
  }

  // All attempts failed — return safe fallback
  logger.error(`[${requestId}] All analysis attempts failed, returning safe fallback`, {
    error: lastError?.message,
  });

  return { ...SAFE_FALLBACK };
}
