"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useTimelineThread } from "@/lib/hooks/use-timeline-thread";
import { roles } from "@/lib/portfolio-data";

export function Experience() {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const timelineRef = useRef<HTMLDivElement>(null);
  const { svgRef, pathRef, knotRef } = useTimelineThread(
    timelineRef,
    "[data-tl-entry]",
  );

  return (
    <section
      id="experience"
      className="relative border-y border-line px-6 py-[clamp(72px,10vw,120px)]"
      style={{ background: "var(--bg2)" }}
    >
      <span
        id="timeline-knot-start"
        aria-hidden
        className="opacity-0 absolute top-0 left-1/2 h-3.25 w-3.25 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-accent shadow-[0_0_10px_var(--glow)]"
        style={{ borderColor: "var(--bg2)" }}
      />
      <div className="mx-auto max-w-240">
        <div ref={headingRef}>
          <p className="mb-2.5 font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
            04 / Experience
          </p>
          <h2 className="mb-14 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
            Where I&apos;ve worked
          </h2>
        </div>
        <div ref={timelineRef} className="relative">
          <svg
            ref={svgRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              ref={pathRef}
              d=""
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.8}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 6px var(--glow))" }}
            />
            <circle
              ref={knotRef}
              r={4.5}
              fill="var(--accent)"
              style={{
                filter: "drop-shadow(0 0 9px var(--glow))",
                opacity: 0,
                transition: "opacity .3s ease",
              }}
            />
          </svg>
          <div className="flex flex-col gap-[clamp(44px,7vw,80px)]">
            {roles.map((role) => (
              <article
                key={role.company}
                data-tl-entry
                className="relative w-[min(440px,100%)] rounded-lg border border-panel-border p-[14px_14px_20px] shadow-[0_18px_44px_rgba(0,0,0,.28)] backdrop-blur-md"
                style={{
                  alignSelf: role.align,
                  transform: `rotate(${role.rotation}deg)`,
                  background: "var(--panel-strong)",
                }}
              >
                <span
                  data-tl-point
                  aria-hidden
                  className="absolute -top-1.75 left-1/2 h-3.25 w-3.25 -translate-x-1/2 rounded-full border-2 bg-accent shadow-[0_0_10px_var(--glow)]"
                  style={{ borderColor: "var(--bg2)" }}
                />
                <div
                  role="img"
                  aria-label="Photo placeholder for this role — replace with a memory from this chapter"
                  className="mb-4 flex aspect-3/2 items-center justify-center rounded border border-line bg-bg"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, var(--chip) 0 12px, transparent 12px 24px)",
                  }}
                >
                  <span className="font-mono text-[11.5px] tracking-[0.08em] text-muted">
                    [ memory photo ]
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-[18px] font-semibold">
                    {role.position}
                  </h3>
                  <span className="font-mono text-[11.5px] text-accent">
                    {role.dates}
                  </span>
                </div>
                <p className="mt-1.25 text-sm font-semibold text-muted">
                  {role.company}
                </p>
                <ul className="mt-3 flex flex-col gap-1.75 pl-4.5">
                  {role.points.map((point) => (
                    <li
                      key={point}
                      className="text-[13.5px] leading-[1.6] text-muted"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
      <span
        id="timeline-knot-end"
        aria-hidden
        className="opacity-0 absolute bottom-0 left-1/2 h-3.25 w-3.25 -translate-x-1/2 translate-y-1/2 rounded-full border-2 bg-accent shadow-[0_0_10px_var(--glow)]"
        style={{ borderColor: "var(--bg2)" }}
      />
    </section>
  );
}
