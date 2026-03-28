"use client";

import type { AnalyzeResponse } from "@/app/api/services/types";
import { SeverityBadge } from "./severity-badge";
import { ActionList } from "./action-list";
import { VerificationPanel } from "./verification-panel";
import { SharePanel } from "./share-panel";
import {
  Phone,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface ResultCardProps {
  data: AnalyzeResponse;
}

export function ResultCard({ data }: ResultCardProps) {
  const [showVerification, setShowVerification] = useState(false);

  return (
    <div
      className="w-full bg-[var(--mr-surface-low)] border border-white/5 animate-float-in"
      role="article"
      aria-label="Emergency triage result"
    >
      {/* ── Header: type + severity ── */}
      <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p
            className="text-xs text-[var(--mr-gold)] uppercase tracking-[0.3em] font-bold mb-1"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Incident Assessment
          </p>
          <h3
            className="text-2xl md:text-3xl font-black italic text-white"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {data.incidentType}
          </h3>
        </div>
        <SeverityBadge severity={data.severity} confidence={data.confidence} />
      </div>

      {/* ── Emergency callout ── */}
      {data.escalation.shouldCallEmergency && (
        <div className="mx-6 mt-5 p-4 bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <Phone className="size-5 text-red-400 shrink-0 mt-0.5 animate-pulse" aria-hidden="true" />
          <div>
            <p className="text-red-400 font-bold text-sm">
              Call Emergency Services Immediately
            </p>
            {data.escalation.recommendedService && (
              <p className="text-red-300 text-xs mt-1">
                Recommended: {data.escalation.recommendedService}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Summary ── */}
      <div className="px-6 py-5 border-b border-white/5">
        <p className="text-[var(--mr-text)] leading-relaxed">{data.summary}</p>

        {/* Language detected */}
        <p className="text-xs text-[var(--mr-text-dim)] mt-3">
          Language detected: <span className="text-[var(--mr-text-muted)]">{data.language}</span>
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="px-6 py-5 border-b border-white/5">
        <ActionList
          immediateActions={data.immediateActions}
          avoidActions={data.avoidActions}
        />
      </div>

      {/* ── Routing suggestion ── */}
      {data.routing.facilityType && (
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-start gap-3 p-4 bg-[var(--mr-cyan)]/5 border border-[var(--mr-cyan)]/20">
            <MapPin className="size-5 text-[var(--mr-cyan)] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-[var(--mr-cyan)] font-bold text-sm">
                Suggested Facility: {data.routing.facilityType}
              </p>
              <p className="text-xs text-[var(--mr-text-muted)] mt-1">
                {data.routing.rationale}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Verification (collapsible) ── */}
      <div className="px-6 py-4 border-b border-white/5">
        <button
          onClick={() => setShowVerification(!showVerification)}
          className="flex items-center gap-2 text-sm text-[var(--mr-text-muted)] hover:text-white transition-colors
                     focus:outline-none focus:text-white w-full"
          aria-expanded={showVerification}
          aria-controls="verification-details"
        >
          {showVerification ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4" aria-hidden="true" />
          )}
          <span className="font-bold italic" style={{ fontFamily: "var(--font-headline)" }}>
            {showVerification ? "Hide" : "Show"} Verification Details
          </span>
        </button>

        {showVerification && (
          <div id="verification-details" className="mt-4">
            <VerificationPanel
              verification={data.verification}
              extractedSignals={data.extractedSignals}
              confidence={data.confidence}
            />
          </div>
        )}
      </div>

      {/* ── Disclaimer ── */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-start gap-2 text-xs text-[var(--mr-text-dim)]">
          <AlertTriangle className="size-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{data.disclaimer}</p>
        </div>
      </div>

      {/* ── Share / Export ── */}
      <div className="px-6 py-4">
        <SharePanel data={data} />
      </div>
    </div>
  );
}
