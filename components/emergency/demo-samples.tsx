"use client";

import { DEMO_SAMPLES } from "@/lib/constants";

interface DemoSamplesProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function DemoSamples({ onSelect, disabled = false }: DemoSamplesProps) {
  return (
    <div className="space-y-3">
      <p
        className="text-xs text-[var(--mr-gold)] uppercase tracking-[0.3em] font-bold"
        style={{ fontFamily: "var(--font-label)" }}
      >
        Try a demo scenario
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEMO_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            onClick={() => onSelect(sample.text)}
            disabled={disabled}
            className="group text-left p-4 bg-[var(--mr-surface)] hover:bg-[var(--mr-surface-high)]
                       border border-transparent hover:border-[var(--mr-gold)]/30
                       transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                       glow-border-hover focus:outline-none focus:border-[var(--mr-gold)]"
            aria-label={`Demo: ${sample.label} — ${sample.text}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg" aria-hidden="true">{sample.icon}</span>
              <span
                className="text-sm font-bold italic text-white group-hover:text-[var(--mr-gold)] transition-colors"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {sample.label}
              </span>
            </div>
            <p className="text-xs text-[var(--mr-text-muted)] line-clamp-2 leading-relaxed">
              &quot;{sample.text}&quot;
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
