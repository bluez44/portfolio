"use client";

import { X } from "lucide-react";

import { TECH_LEVELS, tierNames, type TechItem } from "@/lib/portfolio-data";

const TIER_ACCENT = ["tomato", "blue", "jade"] as const;

export function TechFocusPanel({
  tech,
  onClose,
}: {
  tech: TechItem;
  onClose: () => void;
}) {
  const accent = TIER_ACCENT[tech.tier];
  const levelIndex = TECH_LEVELS.indexOf(tech.level);
  return (
    <div
      role="dialog"
      aria-label="Technology details"
      className="pointer-events-none absolute top-4 right-4 bottom-4 flex w-[min(320px,calc(100%-32px))] flex-col justify-center"
    >
      <div
        className="pointer-events-auto rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper p-6"
        style={{ boxShadow: `6px 6px 0 var(--${accent})` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink px-2.5 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase"
              style={{
                background: `var(--${accent})`,
                color: "var(--paper)",
              }}
            >
              Tier · {tierNames[tech.tier]}
            </p>
            <h3 className="mt-3 font-heading text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">
              {tech.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details and return to full view"
            className="grid h-8 w-8 flex-none place-items-center rounded-full border-[1.5px] border-ink bg-paper text-[14px] leading-none text-ink transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: "2px 2px 0 var(--ink)" }}
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-4 text-[14px] leading-[1.65] text-ink-2">{tech.desc}</p>
        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] text-ink-3 uppercase">
              Proficiency
            </span>
            <span className="font-heading text-[13px] font-semibold text-ink">
              {tech.level}
            </span>
          </div>

          {/* Stepped meter — one segment per named level, filled up to this
              tech's own step. Replaces the old percentage bar: a number implies
              a precision nobody can defend. */}
          <div
            role="img"
            aria-label={`Proficiency: ${tech.level} — step ${levelIndex + 1} of ${TECH_LEVELS.length}`}
            className="flex gap-1.5"
          >
            {TECH_LEVELS.map((step, index) => {
              const filled = index <= levelIndex;
              return (
                <span
                  key={step}
                  title={step}
                  className="h-3 flex-1 rounded-[3px] border-[1.5px] border-ink transition-colors duration-500"
                  style={
                    filled
                      ? {
                          background: `repeating-linear-gradient(-45deg, var(--${accent}) 0 6px, color-mix(in oklab, var(--${accent}) 65%, var(--ink)) 6px 12px)`,
                        }
                      : { background: "var(--paper-2)" }
                  }
                />
              );
            })}
          </div>

          <div className="mt-1.5 flex justify-between font-mono text-[9px] tracking-[0.16em] text-ink-3 uppercase">
            <span>{TECH_LEVELS[0]}</span>
            <span>{TECH_LEVELS[TECH_LEVELS.length - 1]}</span>
          </div>
        </div>

        {tech.years ? (
          <p className="mt-4 font-mono text-[11px] tracking-[0.14em] text-ink-2 uppercase">
            Experience —{" "}
            <span className="font-semibold text-ink">{tech.years}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
