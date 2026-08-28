"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { certifications, education } from "@/lib/portfolio-data";

export function Education() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>(true);

  return (
    <section id="education" className="relative px-6 py-[clamp(80px,10vw,140px)]">
      <div className="mx-auto max-w-6xl">
        {/* section head */}
        <div ref={headerRef} className="mb-14 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
              06 · Education
            </span>
            <span aria-hidden className="h-px flex-1 max-w-40 bg-ink/20" />
          </div>
          <h2
            className="font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5rem)",
              fontVariationSettings: '"wdth" 90, "opsz" 96',
            }}
          >
            Papers &amp;{" "}
            <span
              className="italic text-tomato"
              style={{ fontVariationSettings: '"wdth" 82' }}
            >
              proofs.
            </span>
          </h2>
        </div>

        <div ref={gridRef} className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          {/* diploma column */}
          <div className="flex flex-col gap-6">
            {education.map((entry, index) => (
              <article
                key={entry.degree}
                className="relative rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper p-8"
                style={{ boxShadow: "8px 8px 0 var(--blue)" }}
              >
                {/* decorative corners */}
                <span
                  aria-hidden
                  className="absolute top-3 left-3 h-4 w-4 border-t-[1.5px] border-l-[1.5px] border-blue"
                />
                <span
                  aria-hidden
                  className="absolute top-3 right-3 h-4 w-4 border-t-[1.5px] border-r-[1.5px] border-blue"
                />
                <span
                  aria-hidden
                  className="absolute bottom-3 left-3 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-blue"
                />
                <span
                  aria-hidden
                  className="absolute bottom-3 right-3 h-4 w-4 border-b-[1.5px] border-r-[1.5px] border-blue"
                />

                <p className="text-center font-mono text-[10px] tracking-[0.32em] text-ink-2 uppercase">
                  Diploma · 0{index + 1}
                </p>
                <div
                  className="mx-auto mt-2 h-px w-16"
                  style={{ background: "var(--ink)" }}
                />
                <h3
                  className="mt-6 text-center font-heading font-bold leading-[1.1] tracking-[-0.02em] text-ink"
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontVariationSettings: '"wdth" 88, "opsz" 96',
                  }}
                >
                  {entry.degree}
                </h3>
                <p className="mt-3 text-center text-[15px] leading-[1.5] text-ink-2">
                  {entry.school}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t-[1.5px] border-ink/15 pt-4">
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-ink-3 uppercase">
                      Years
                    </span>
                    <span className="font-heading text-[16px] font-semibold text-ink">
                      {entry.dates}
                    </span>
                  </span>
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-ink-3 uppercase">
                      Grade
                    </span>
                    <span className="font-heading text-[16px] font-semibold text-ink">
                      {entry.note}
                    </span>
                  </span>
                </div>

                {/* seal */}
                <span
                  aria-hidden
                  className="absolute -right-4 -bottom-4 grid h-16 w-16 place-items-center rounded-full border-[1.5px] border-ink bg-tomato font-heading text-[11px] font-bold text-paper"
                  style={{
                    boxShadow: "3px 3px 0 var(--ink)",
                    transform: "rotate(-8deg)",
                  }}
                >
                  <span className="text-center leading-tight">
                    HCMUT
                    <br />
                    · 26 ·
                  </span>
                </span>
              </article>
            ))}
          </div>

          {/* receipt column */}
          <div
            className="relative rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper p-6"
            style={{ boxShadow: "6px 6px 0 var(--jade)" }}
          >
            {/* torn edge top */}
            <div
              aria-hidden
              className="absolute -top-2 right-4 left-4 h-2"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, var(--paper) 0 4px, transparent 4px 8px)",
              }}
            />

            <div className="flex items-baseline justify-between border-b-[1.5px] border-dashed border-ink pb-3">
              <p className="font-mono text-[11px] tracking-[0.22em] text-ink uppercase">
                Certifications
              </p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-ink-2 uppercase">
                Rcpt · 03
              </p>
            </div>

            <div className="mt-2 flex flex-col">
              {certifications.map((cert, index) => (
                <div
                  key={cert.name}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-dotted border-ink/40 py-4 last:border-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[10px] font-semibold text-ink-3">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold leading-tight text-ink">
                        {cert.name}
                      </p>
                      <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-ink-2 uppercase">
                        {cert.issuer}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center rounded-full border-[1.5px] border-ink px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.1em] text-ink uppercase"
                    style={{ background: "var(--canary)" }}
                  >
                    {cert.year}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t-[1.5px] border-dashed border-ink pt-3">
              <p className="font-mono text-[10px] tracking-[0.18em] text-ink-2 uppercase">
                Total
              </p>
              <p className="font-heading text-[16px] font-bold text-ink">
                {certifications.length} × verified
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
