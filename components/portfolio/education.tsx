"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { certifications, education } from "@/lib/portfolio-data";

export function Education() {
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="education" className="px-6 py-[clamp(72px,10vw,120px)]">
      <div ref={revealRef} className="mx-auto max-w-280">
        <p className="mb-2.5 font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          05 / Education
        </p>
        <h2 className="mb-11 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          Education &amp; certifications
        </h2>
        <div className="grid items-start gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          <div className="flex flex-col gap-4.5">
            {education.map((entry) => (
              <div
                key={entry.degree}
                className="rounded-2xl border border-panel-border bg-panel p-[24px_26px] backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-[17px] font-semibold">
                    {entry.degree}
                  </h3>
                  <span className="font-mono text-xs text-accent">{entry.dates}</span>
                </div>
                <p className="mt-1.5 text-sm text-muted">{entry.school}</p>
                <p className="mt-2.5 text-[13.5px] leading-[1.6] text-muted">
                  {entry.note}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-panel-border bg-panel p-[24px_26px] backdrop-blur-sm">
            <p className="mb-3.5 font-mono text-[11.5px] tracking-[0.14em] text-muted uppercase">
              Certifications
            </p>
            <div className="flex flex-col">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="flex flex-wrap items-baseline justify-between gap-1.5 border-b border-line py-3.25"
                >
                  <div>
                    <p className="text-[14.5px] font-semibold">{cert.name}</p>
                    <p className="mt-0.75 text-[12.5px] text-muted">{cert.issuer}</p>
                  </div>
                  <span className="font-mono text-xs text-accent">{cert.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
