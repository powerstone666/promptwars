/**
 * Shared types for the Universal Emergency Interpreter.
 *
 * All AI outputs, API payloads and inter-service contracts
 * are defined here so every layer speaks the same language.
 */

/* ── Enums ── */

export const SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

export const VERIFICATION_STATUS = {
  VERIFIED: "verified",
  PARTIALLY_VERIFIED: "partially_verified",
  NEEDS_CONFIRMATION: "needs_confirmation",
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

/* ── Request / Response ── */

export interface AnalyzeRequest {
  /** The raw messy input from the user */
  text?: string;
  /** Optional language hint (ISO 639-1) */
  languageHint?: string;
  /** Optional recorded voice input as a data URL */
  audioBase64?: string;
}

export interface Escalation {
  shouldCallEmergency: boolean;
  recommendedService: string | null;
}

export interface Routing {
  facilityType: string | null;
  rationale: string;
}

export interface Verification {
  status: VerificationStatus;
  notes: string[];
}

export interface AnalyzeResponse {
  /** e.g. "Medical Emergency", "Civic Hazard", "Public Safety" */
  incidentType: string;
  severity: Severity;
  /** 0-1 confidence score */
  confidence: number;
  /** Detected / assumed language */
  language: string;
  /** Plain-language summary of the situation */
  summary: string;
  /** Key signals extracted from the input */
  extractedSignals: string[];
  /** What to do RIGHT NOW */
  immediateActions: string[];
  /** What to AVOID doing */
  avoidActions: string[];
  escalation: Escalation;
  routing: Routing;
  verification: Verification;
  /** Mandatory safety disclaimer */
  disclaimer: string;
}

/* ── Internal helpers ── */

export interface SafeFallbackResponse extends AnalyzeResponse {
  _fallback: true;
}

export interface AnalyzeResult {
  success: true;
  data: AnalyzeResponse;
  requestId: string;
  processedAt: string;
}

export interface AnalyzeError {
  success: false;
  error: string;
  requestId: string;
  processedAt: string;
}
