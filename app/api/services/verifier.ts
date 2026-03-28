/**
 * Verifier — deterministic post-processing of AI output.
 *
 * Applies guardrails that the LLM might miss:
 * - severity sanity checks
 * - confidence downgrading when signals are weak
 * - blocking unsafe overclaiming
 */

import type { AnalyzeResponse, Severity } from "./types";
import { Logger } from "./logger";

const logger = new Logger({
  minLevel: 0,
  format: "json",
  includeCaller: false,
});

/** Keywords that strongly suggest critical severity */
const CRITICAL_KEYWORDS = [
  "chest pain",
  "not breathing",
  "unconscious",
  "heart attack",
  "stroke",
  "seizure",
  "severe bleeding",
  "anaphylaxis",
  "choking",
  "drowning",
  "cardiac arrest",
  "gunshot",
  "stabbing",
  "explosion",
  "building collapse",
  "gas leak",
];

/** Keywords that suggest at least high severity */
const HIGH_KEYWORDS = [
  "fainted",
  "faint",
  "fainting",
  "burn",
  "fire",
  "smoke",
  "chemical",
  "electri",
  "spark",
  "trapped",
  "flood",
  "poison",
  "overdose",
  "broken bone",
  "fracture",
  "head injury",
  "power line",
];

const UNSAFE_PHRASES = [
  "confirmed diagnosis",
  "you definitely have",
  "guaranteed safe",
  "no need to worry",
  "this is certainly",
  "diagnosed with",
  "you are suffering from",
];

/**
 * Verify and adjust AI analysis with deterministic guardrails.
 */
export function verifyAnalysis(
  analysis: AnalyzeResponse,
  originalInput: string,
  requestId: string,
): AnalyzeResponse {
  const result = { ...analysis };
  const inputLower = originalInput.toLowerCase();
  const notes: string[] = [...result.verification.notes];

  // ── 1. Severity floor check ──
  const hasCriticalKeyword = CRITICAL_KEYWORDS.some((kw) => inputLower.includes(kw));
  const hasHighKeyword = HIGH_KEYWORDS.some((kw) => inputLower.includes(kw));

  if (hasCriticalKeyword && severityRank(result.severity) < severityRank("critical")) {
    logger.warn(`[${requestId}] Upgrading severity to critical — critical keyword detected`);
    result.severity = "critical";
    notes.push("Severity upgraded: critical-level keywords detected in input");
  } else if (hasHighKeyword && severityRank(result.severity) < severityRank("high")) {
    logger.warn(`[${requestId}] Upgrading severity to high — high-risk keyword detected`);
    result.severity = "high";
    notes.push("Severity upgraded: high-risk keywords detected in input");
  }

  // ── 2. Confidence downgrade for weak signals ──
  if (result.extractedSignals.length < 2 && result.confidence > 0.6) {
    result.confidence = Math.min(result.confidence, 0.5);
    notes.push("Confidence reduced: few signals extracted from input");
  }

  if (originalInput.length < 20 && result.confidence > 0.5) {
    result.confidence = Math.min(result.confidence, 0.4);
    notes.push("Confidence reduced: very short input provides limited context");
  }

  // ── 3. Emergency escalation sanity ──
  if (
    severityRank(result.severity) >= severityRank("high") &&
    !result.escalation.shouldCallEmergency
  ) {
    result.escalation.shouldCallEmergency = true;
    result.escalation.recommendedService =
      result.escalation.recommendedService ?? "Local Emergency Services (911/112/108)";
    notes.push("Escalation enforced: high/critical severity requires emergency services");
  }

  // ── 4. Block unsafe overclaiming ──
  const summaryLower = result.summary.toLowerCase();
  const hasUnsafe = UNSAFE_PHRASES.some(
    (phrase) =>
      summaryLower.includes(phrase) ||
      result.immediateActions.some((a) => a.toLowerCase().includes(phrase)),
  );

  if (hasUnsafe) {
    logger.warn(`[${requestId}] Unsafe language detected in AI output — sanitizing`);
    result.verification.status = "needs_confirmation";
    notes.push("Flagged: AI output contained potentially unsafe diagnostic language");
  }

  // ── 5. Ensure disclaimer exists and is adequate ──
  if (!result.disclaimer || result.disclaimer.length < 20) {
    result.disclaimer =
      "This is an AI-generated triage assessment, not a medical or professional diagnosis. Always contact local emergency services for confirmed emergencies.";
  }

  result.verification.notes = notes;

  return result;
}

function severityRank(severity: Severity): number {
  const ranks: Record<Severity, number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };
  return ranks[severity] ?? 0;
}
