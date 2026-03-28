"use client";

import { SEVERITY_CONFIG } from "@/lib/constants";
import type { Severity } from "@/app/api/services/types";
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";

interface SeverityBadgeProps {
  severity: Severity;
  confidence: number;
  className?: string;
}

const SEVERITY_ICONS: Record<Severity, React.ElementType> = {
  low: ShieldCheck,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: ShieldAlert,
};

export function SeverityBadge({ severity, confidence, className = "" }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = SEVERITY_ICONS[severity];
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div
      className={`inline-flex items-center gap-3 px-4 py-2 border ${config.borderColor} ${config.bgColor} ${className}`}
      role="status"
      aria-label={`Severity: ${config.label}, Confidence: ${confidencePercent}%`}
    >
      <Icon
        className={`size-5 ${config.color} ${severity === "critical" ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      <span
        className={`font-black italic text-sm tracking-wider uppercase ${config.color}`}
        style={{ fontFamily: "var(--font-headline)" }}
      >
        {config.label}
      </span>
      <span className="text-xs text-[var(--mr-text-dim)] border-l border-white/10 pl-3">
        {confidencePercent}% confidence
      </span>
    </div>
  );
}
