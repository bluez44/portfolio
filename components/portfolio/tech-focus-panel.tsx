"use client";

import { tierNames, type TechItem } from "@/lib/portfolio-data";

export function TechFocusPanel({
  tech,
  onClose,
}: {
  tech: TechItem;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Technology details"
      className="pointer-events-none absolute top-4 right-4 bottom-4 flex w-[min(320px,calc(100%-32px))] flex-col justify-center"
    >
      <div
        className="pointer-events-auto rounded-2xl border border-panel-border p-6 shadow-[0_12px_44px_rgba(0,0,0,.35)] backdrop-blur-xl"
        style={{ background: "var(--panel-strong)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
              {tierNames[tech.tier]}
            </p>
            <h3 className="mt-[6px] font-heading text-[22px] font-bold">
              {tech.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details and return to full view"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-panel-border bg-chip text-[15px] leading-none transition hover:border-accent hover:text-accent"
          >
            ×
          </button>
        </div>
        <p className="mt-[14px] text-sm leading-[1.7] text-muted">{tech.desc}</p>
        <div className="mt-[18px]">
          <div className="mb-[6px] flex justify-between text-[12.5px] text-muted">
            <span>Proficiency</span>
            <span className="font-semibold text-fg">{tech.profLabel}</span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-chip">
            <div
              className="h-full rounded-full bg-accent shadow-[0_0_10px_var(--glow)] transition-[width] duration-500"
              style={{ width: `${tech.prof}%` }}
            />
          </div>
        </div>
        <p className="mt-[14px] text-[13px] text-muted">
          Experience — <span className="font-semibold text-fg">{tech.years}</span>
        </p>
      </div>
    </div>
  );
}
