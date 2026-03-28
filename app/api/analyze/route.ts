/**
 * POST /api/analyze
 *
 * Main endpoint for the Universal Emergency Interpreter.
 * Thin handler: validate → analyze → verify → compose → respond.
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema } from "../services/schemas";
import { analyzeIncident } from "../services/incident-analyzer";
import { verifyAnalysis } from "../services/verifier";
import { composeActions } from "../services/action-composer";
import { Logger } from "../services/logger";
import type { AnalyzeResult, AnalyzeError } from "../services/types";

const logger = new Logger({
  minLevel: 0,
  format: "json",
  includeCaller: false,
});

/* ── Simple in-memory rate limiter ── */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_MAX;
}

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Route handler ── */

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  logger.info(`[${requestId}] Analyze request received`, { ip });

  // ── Rate limit ──
  if (isRateLimited(ip)) {
    logger.warn(`[${requestId}] Rate limited`, { ip });
    return NextResponse.json<AnalyzeError>(
      {
        success: false,
        error: "Too many requests. Please wait a moment and try again.",
        requestId,
        processedAt: new Date().toISOString(),
      },
      { status: 429 },
    );
  }

  // ── Parse & validate request body ──
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<AnalyzeError>(
      {
        success: false,
        error: "Invalid JSON in request body.",
        requestId,
        processedAt: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  const validation = analyzeRequestSchema.safeParse(body);

  if (!validation.success) {
    const issues = validation.error.issues.map((i) => i.message).join("; ");
    logger.warn(`[${requestId}] Validation failed`, { issues });
    return NextResponse.json<AnalyzeError>(
      {
        success: false,
        error: `Validation error: ${issues}`,
        requestId,
        processedAt: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  const { text, languageHint, imageBase64, outputLanguage } = validation.data;

  try {
    // ── 1. Analyze —— AI call + parse + validate ──
    const rawAnalysis = await analyzeIncident(text, requestId, languageHint, imageBase64, outputLanguage);

    // ── 2. Verify —— deterministic guardrails ──
    const verified = verifyAnalysis(rawAnalysis, text, requestId);

    // ── 3. Compose —— enrich with supplementary actions ──
    const final = composeActions(verified);

    const elapsed = Date.now() - startTime;
    logger.info(`[${requestId}] Analysis complete in ${elapsed}ms`, {
      severity: final.severity,
      incidentType: final.incidentType,
      confidence: final.confidence,
    });

    return NextResponse.json<AnalyzeResult>({
      success: true,
      data: final,
      requestId,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error(`[${requestId}] Unhandled error in analyze pipeline`, {
      error: message,
    });

    return NextResponse.json<AnalyzeError>(
      {
        success: false,
        error: "Analysis failed. Please try again.",
        requestId,
        processedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
