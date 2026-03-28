"use client";

import { CheckCircle, XCircle } from "lucide-react";

interface ActionListProps {
  immediateActions: string[];
  avoidActions: string[];
}

export function ActionList({ immediateActions, avoidActions }: ActionListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* DO — Immediate Actions */}
      <div className="space-y-3">
        <h4
          className="flex items-center gap-2 text-emerald-400 font-bold italic text-sm uppercase tracking-wider"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          <CheckCircle className="size-4" aria-hidden="true" />
          Immediate Actions
        </h4>
        <ul className="space-y-2" role="list" aria-label="Actions to take immediately">
          {immediateActions.map((action, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-[var(--mr-text)] bg-emerald-400/5 border border-emerald-400/10 px-4 py-3"
            >
              <span className="text-emerald-400 font-bold mt-0.5 shrink-0">{i + 1}.</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DON'T — Avoid Actions */}
      <div className="space-y-3">
        <h4
          className="flex items-center gap-2 text-red-400 font-bold italic text-sm uppercase tracking-wider"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          <XCircle className="size-4" aria-hidden="true" />
          What to Avoid
        </h4>
        <ul className="space-y-2" role="list" aria-label="Things to avoid">
          {avoidActions.map((action, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-[var(--mr-text-muted)] bg-red-400/5 border border-red-400/10 px-4 py-3"
            >
              <XCircle className="size-4 text-red-400/60 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
