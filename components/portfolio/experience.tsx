"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { roles } from "@/lib/portfolio-data";

const ROLE_ACCENTS = ["tomato", "blue", "jade", "canary"] as const;
const TAPE_ROTATIONS = [-4, 3, -2, 5];

export function Experience() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const timelineRef = useScrollReveal<HTMLDivElement>(true);

  return (
    <section
      id="experience"
      className="relative border-y-[1.5px] border-ink px-6 py-[clamp(80px,10vw,140px)]"
      style={{ background: "var(--paper-2)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* section head */}
        <div ref={headerRef} className="mb-16 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
              05 · Experience
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
            Where I&apos;ve{" "}
            <span
              className="italic text-jade"
              style={{ fontVariationSettings: '"wdth" 82' }}
            >
              worked.
            </span>
          </h2>
          <p className="max-w-md text-[16px] leading-[1.6] text-ink-2">
            Index cards from the field — pinned to the board in the order they
            happened.
          </p>
        </div>

        {/* corkboard timeline */}
        <div ref={timelineRef} className="relative">
          {/* central dashed spine */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 left-1/2 hidden -translate-x-1/2 lg:block"
            style={{
              width: "2px",
              background:
                "repeating-linear-gradient(to bottom, var(--ink) 0 8px, transparent 8px 16px)",
            }}
          />

          <div className="flex flex-col gap-16 lg:gap-24">
            {roles.map((role, index) => {
              const accent = ROLE_ACCENTS[index % ROLE_ACCENTS.length];
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={role.company}
                  className={`relative flex ${
                    isLeft ? "lg:justify-start" : "lg:justify-end"
                  }`}
                >
                  {/* spine knot */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-8 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full border-[1.5px] border-ink lg:block"
                    style={{
                      background: `var(--${accent})`,
                      boxShadow: "2px 2px 0 var(--ink)",
                    }}
                  />

                  <article
                    className="relative w-full max-w-[440px] rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper p-6 pt-8"
                    style={{
                      transform: `rotate(${role.rotation * 0.6}deg)`,
                      boxShadow: `6px 6px 0 var(--${accent})`,
                    }}
                  >
                    {/* washi tape strip */}
                    <span
                      aria-hidden
                      className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 border-[1.5px] border-ink"
                      style={{
                        background: `var(--${accent})`,
                        transform: `translate(-50%, 0) rotate(${TAPE_ROTATIONS[index % TAPE_ROTATIONS.length]}deg)`,
                        backgroundImage:
                          "repeating-linear-gradient(-45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 8px)",
                      }}
                    />

                    {/* year chip */}
                    <div className="mb-4 flex items-baseline justify-between gap-3">
                      <span
                        className="inline-flex items-center rounded-full border-[1.5px] border-ink bg-paper-2 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-ink uppercase"
                      >
                        {role.dates}
                      </span>
                      <span
                        className="font-heading text-3xl font-bold leading-none"
                        style={{
                          color: `var(--${accent})`,
                          fontVariationSettings: '"wdth" 80, "opsz" 96',
                        }}
                      >
                        0{index + 1}
                      </span>
                    </div>

                    <h3
                      className="font-heading text-[22px] font-bold leading-tight tracking-[-0.015em] text-ink"
                      style={{ fontVariationSettings: '"wdth" 92' }}
                    >
                      {role.position}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 font-mono text-[12px] text-ink-2">
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: `var(--${accent})` }}
                      />
                      <span className="font-semibold uppercase tracking-[0.14em]">
                        {role.company}
                      </span>
                    </p>

                    <ul className="mt-5 flex flex-col gap-3">
                      {role.points.map((point, i) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 border-b border-ink/12 pb-3 last:border-none"
                        >
                          <span
                            className="mt-1.5 flex-none font-mono text-[10px] font-semibold tracking-[0.14em] text-ink-3 uppercase"
                            style={{ minWidth: "1.5rem" }}
                          >
                            0{i + 1}
                          </span>
                          <span className="text-[14px] leading-[1.6] text-ink">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
