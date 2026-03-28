"use client";

import { Eye, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import type { Verification } from "@/app/api/services/types";

interface VerificationPanelProps {
  verification: Verification;
  extractedSignals: string[];
  confidence: number;
}

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle,
    label: "Verified",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  partially_verified: {
    icon: AlertTriangle,
    label: "Partially Verified",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/20",
  },
  needs_confirmation: {
    icon: HelpCircle,
    label: "Needs Confirmation",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
  },
};

export function VerificationPanel({
  verification,
  extractedSignals,
  confidence,
}: VerificationPanelProps) {
  const statusCfg = STATUS_CONFIG[verification.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="space-y-4">
      <h4
        className="flex items-center gap-2 text-(--mr-cyan) font-bold italic text-sm uppercase tracking-wider"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        <Eye className="size-4" aria-hidden="true" />
        Verification Details
      </h4>

      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 border ${statusCfg.borderColor} ${statusCfg.bgColor}`}
      >
        <StatusIcon className={`size-4 ${statusCfg.color}`} aria-hidden="true" />
        <span className={`text-sm font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
      </div>

      {/* Extracted signals */}
      <div>
        <p className="text-xs text-(--mr-text-dim) uppercase tracking-wider mb-2">
          Extracted Signals
        </p>
        <div className="flex flex-wrap gap-2">
          {extractedSignals.map((signal, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 bg-(--mr-surface-high) text-(--mr-text) border border-white/5"
            >
              {signal}
            </span>
          ))}
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <p className="text-xs text-(--mr-text-dim) uppercase tracking-wider mb-2">
          AI Confidence
        </p>
        <div className="w-full h-2 bg-(--mr-surface-high) overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-(--mr-cyan) to-(--mr-gold) transition-all duration-700"
            style={{ width: `${Math.round(confidence * 100)}%` }}
            role="progressbar"
            aria-valuenow={Math.round(confidence * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`AI confidence: ${Math.round(confidence * 100)}%`}
          />
        </div>
        <p className="text-xs text-(--mr-text-dim) mt-1">
          {Math.round(confidence * 100)}% — {confidence >= 0.7 ? "High confidence" : confidence >= 0.4 ? "Moderate confidence" : "Low confidence — seek professional confirmation"}
        </p>
      </div>

      {/* Verification notes */}
      {verification.notes.length > 0 && (
        <div>
          <p className="text-xs text-(--mr-text-dim) uppercase tracking-wider mb-2">
            Assessment Notes
          </p>
          <ul className="space-y-1.5">
            {verification.notes.map((note, i) => (
              <li
                key={i}
                className="text-xs text-(--mr-text-muted) flex items-start gap-2"
              >
                <span className="text-(--mr-text-dim) mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
