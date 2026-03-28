/**
 * App-wide constants for the Universal Emergency Interpreter.
 */

import type { Severity } from "@/app/api/services/types";

/* ── Input limits ── */
export const MAX_INPUT_CHARS = 4_000;
export const MAX_UPLOAD_MB = 5;

/* ── API timeouts ── */
export const AI_TIMEOUT_MS = 30_000;
export const AI_MAX_RETRIES = 1;

/* ── Rate limiting ── */
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 10;

/* ── Severity visual mapping ── */
export const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bgColor: string; borderColor: string; icon: string }
> = {
  low: {
    label: "Low",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    icon: "🟢",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    icon: "🟡",
  },
  high: {
    label: "High",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    icon: "🟠",
  },
  critical: {
    label: "Critical",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/30",
    icon: "🔴",
  },
};

/* ── Demo samples ── */
export const DEMO_SAMPLES = [
  {
    label: "Medical Panic",
    icon: "🏥",
    text: "my mother is sweating, chest pain, fainted, please help fast",
  },
  {
    label: "Civic Hazard",
    icon: "⚡",
    text: "electric wire fell near school after rain, sparks visible",
  },
  {
    label: "Public Safety",
    icon: "🏭",
    text: "chemical smell and smoke coming from small warehouse near houses",
  },
  {
    label: "Mixed Language",
    icon: "🌐",
    text: "amma faint ayindi, sweating, chest pain, please help",
  },
  {
    label: "Natural Disaster",
    icon: "🌊",
    text: "road blocked, smoke, people are running, flooding in basement",
  },
] as const;
