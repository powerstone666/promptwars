"use client";

import { Copy, Download, Check } from "lucide-react";
import { useState } from "react";
import type { AnalyzeResponse } from "@/app/api/services/types";

interface SharePanelProps {
  data: AnalyzeResponse;
}

export function SharePanel({ data }: SharePanelProps) {
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `🚨 EMERGENCY TRIAGE REPORT`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Type: ${data.incidentType}`,
    `Severity: ${data.severity.toUpperCase()}`,
    `Confidence: ${Math.round(data.confidence * 100)}%`,
    ``,
    `📋 Summary:`,
    data.summary,
    ``,
    `✅ Immediate Actions:`,
    ...data.immediateActions.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `⛔ Avoid:`,
    ...data.avoidActions.map((a) => `• ${a}`),
    ``,
    data.escalation.shouldCallEmergency
      ? `🆘 CALL: ${data.escalation.recommendedService ?? "Emergency Services"}`
      : "",
    ``,
    `⚠️ ${data.disclaimer}`,
  ]
    .filter(Boolean)
    .join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const area = document.createElement("textarea");
      area.value = summaryText;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownloadJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emergency-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-5 py-2.5 bg-(--mr-surface) hover:bg-(--mr-surface-high)
                   border border-white/10 hover:border-(--mr-gold)/30
                   text-sm font-bold text-white transition-all
                   focus:outline-none focus:border-(--mr-gold)"
        aria-label="Copy emergency report to clipboard"
      >
        {copied ? (
          <>
            <Check className="size-4 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="size-4" />
            <span>Copy Report</span>
          </>
        )}
      </button>

      <button
        onClick={handleDownloadJSON}
        className="flex items-center gap-2 px-5 py-2.5 bg-(--mr-surface) hover:bg-(--mr-surface-high)
                   border border-white/10 hover:border-(--mr-gold)/30
                   text-sm font-bold text-white transition-all
                   focus:outline-none focus:border-(--mr-gold)"
        aria-label="Download emergency report as JSON"
      >
        <Download className="size-4" />
        <span>Download JSON</span>
      </button>
    </div>
  );
}
