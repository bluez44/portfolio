"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { stats } from "@/lib/portfolio-data";

export function About() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const statsRef = useScrollReveal<HTMLDivElement>(true);

  return (
    <section id="about" className="px-6 py-[clamp(72px,10vw,120px)]">
      <div ref={revealRef} className="mx-auto max-w-[1120px]">
        <p className="mb-[10px] font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          01 / About
        </p>
        <h2 className="mb-11 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          A little about me
        </h2>
        <div className="grid items-start gap-11 [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
          <div className="relative max-w-[380px]">
            <div
              role="img"
              aria-label="Portrait placeholder — replace with your photo"
              className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-panel-border bg-bg2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, var(--panel) 0 12px, transparent 12px 24px)",
              }}
            >
              <span className="font-mono text-xs tracking-[0.08em] text-muted">
                [ portrait photo ]
              </span>
            </div>
            <div
              aria-hidden
              className="absolute -z-10 rounded-2xl border"
              style={{
                inset: "14px -14px -14px 14px",
                borderColor: "var(--accent-dim)",
              }}
            />
          </div>
          <div>
            <p className="text-[16.5px] leading-[1.85] text-muted">
              [Short bio — a few sentences about your background, the kind of
              engineering you love, notable domains you&apos;ve worked in,
              and what you&apos;re looking for next. Keep it human and
              specific.]
            </p>
            <p className="mt-[18px] text-[16.5px] leading-[1.85] text-muted">
              [Optional second paragraph — interests outside of code,
              open-source work, writing, or community involvement.]
            </p>
            <div
              ref={statsRef}
              className="mt-[38px] grid gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-panel-border bg-panel p-[20px_18px] backdrop-blur-sm"
                >
                  <p className="font-heading text-[30px] font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="mt-[6px] text-[13px] text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
