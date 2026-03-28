/**
 * Zod schemas for validating all inputs and outputs.
 *
 * Every boundary (HTTP request, AI response) is gated by a schema
 * so malformed data never propagates silently.
 */

import { z } from "zod/v4";
import { MAX_INPUT_CHARS } from "@/lib/constants";

/* ── Request schemas ── */

/** Max image size in base64 chars (~5MB file ≈ ~7MB base64) */
const MAX_IMAGE_BASE64_CHARS = 7_000_000;

export const analyzeRequestSchema = z.object({
  text: z
    .string()
    .min(5, "Input must be at least 5 characters")
    .max(MAX_INPUT_CHARS, `Input must be under ${MAX_INPUT_CHARS} characters`)
    .transform((s) => s.trim()),
  languageHint: z.string().max(10).optional(),
  imageBase64: z
    .string()
    .max(MAX_IMAGE_BASE64_CHARS, "Image is too large (max ~5MB)")
    .refine(
      (s) => s.startsWith("data:image/"),
      "Image must be a valid data URI (data:image/...)",
    )
    .optional(),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;

/* ── Severity & status enums ── */

export const severitySchema = z.enum(["low", "medium", "high", "critical"]);

export const verificationStatusSchema = z.enum([
  "verified",
  "partially_verified",
  "needs_confirmation",
]);

/* ── AI response schema ── */

export const analyzeResponseSchema = z.object({
  incidentType: z.string().min(1),
  severity: severitySchema,
  confidence: z.number().min(0).max(1),
  language: z.string().min(1),
  summary: z.string().min(10),
  extractedSignals: z.array(z.string()).min(1),
  immediateActions: z.array(z.string()).min(1),
  avoidActions: z.array(z.string()),
  escalation: z.object({
    shouldCallEmergency: z.boolean(),
    recommendedService: z.string().nullable(),
  }),
  routing: z.object({
    facilityType: z.string().nullable(),
    rationale: z.string(),
  }),
  verification: z.object({
    status: verificationStatusSchema,
    notes: z.array(z.string()),
  }),
  disclaimer: z.string().min(10),
});
