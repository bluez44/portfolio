"use client";

import Image from "next/image";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { aboutPanels } from "@/lib/portfolio-data";

const PANEL_ACCENTS = ["tomato", "blue", "jade"] as const;

export function About() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const panelsRef = useScrollReveal<HTMLDivElement>(true);

  return (
    <section
      id="about"
      className="relative px-6 py-[clamp(80px,10vw,140px)]"
    >
      <div className="mx-auto max-w-7xl">
        {/* section head */}
        <div ref={headerRef} className="mb-16 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
              02 · About
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
            The person behind{" "}
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute -inset-x-1 bottom-[12%] -z-0 h-[36%] bg-canary"
                style={{ transform: "rotate(-1deg)" }}
              />
              <span className="relative z-10">the code.</span>
            </span>
          </h2>
        </div>

        {/* three panels — asymmetric alternating */}
        <div ref={panelsRef} className="flex flex-col gap-16 lg:gap-24">
          {aboutPanels.map((panel, index) => {
            const accent = PANEL_ACCENTS[index % PANEL_ACCENTS.length];
            const reverse = index % 2 === 1;
            const isMetrics = !!panel.stats;

            return (
              <article
                key={panel.kicker}
                className={`grid gap-8 lg:gap-14 ${
                  isMetrics
                    ? "lg:grid-cols-1"
                    : reverse
                      ? "lg:grid-cols-[5fr_7fr]"
                      : "lg:grid-cols-[7fr_5fr]"
                }`}
              >
                {/* text side (or full width for metrics) */}
                <div
                  className={`flex flex-col ${
                    reverse && !isMetrics ? "lg:order-2" : ""
                  }`}
                >
                  <div className="mb-5 flex items-baseline gap-4">
                    <span
                      className="font-heading text-6xl font-bold leading-none"
                      style={{
                        color: `var(--${accent})`,
                        fontVariationSettings: '"wdth" 80, "opsz" 96',
                      }}
                    >
                      0{index + 1}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.24em] text-ink-2 uppercase">
                      / {panel.kicker}
                    </span>
                  </div>

                  <h3
                    className="mb-6 font-heading font-semibold leading-[1.05] tracking-[-0.02em] text-ink"
                    style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}
                  >
                    {panel.title}
                  </h3>

                  {panel.description && (
                    <p className="max-w-prose text-[17px] leading-[1.72] text-ink-2">
                      {panel.description}
                    </p>
                  )}

                  {panel.body && (
                    <ul className="mt-2 flex flex-col gap-3">
                      {panel.body.map((item, i) => (
                        <li
                          key={item}
                          className="group flex items-start gap-4 border-b border-ink/12 pb-3 last:border-none"
                        >
                          <span
                            className="mt-1.5 flex-none font-mono text-[11px] tracking-[0.18em] text-ink-3 uppercase"
                            style={{ minWidth: "2rem" }}
                          >
                            0{i + 1}
                          </span>
                          <span className="text-[17px] leading-[1.6] text-ink">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {panel.stats && (
                    <div className="grid gap-6 sm:grid-cols-3 lg:mt-4">
                      {panel.stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="relative rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper p-6"
                          style={{ boxShadow: "5px 5px 0 var(--tomato)" }}
                        >
                          <p
                            className="font-heading text-6xl font-bold leading-none text-ink"
                            style={{
                              fontVariationSettings: '"wdth" 82, "opsz" 96',
                            }}
                          >
                            {stat.value}
                          </p>
                          <p className="mt-3 text-[13px] leading-[1.5] text-ink-2">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* portrait side */}
                {!isMetrics && (
                  <div
                    className={`relative ${
                      reverse ? "lg:order-1" : ""
                    }`}
                  >
                    <div
                      className="relative overflow-hidden rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper-2"
                      style={{
                        aspectRatio: "4/5",
                        boxShadow: `8px 8px 0 var(--${accent})`,
                      }}
                    >
                      {/* halftone texture overlay */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-10 opacity-25 mix-blend-multiply"
                        style={{
                          background:
                            "radial-gradient(color-mix(in oklab, var(--ink) 20%, transparent) 1px, transparent 1.5px)",
                          backgroundSize: "10px 10px",
                        }}
                      />
                      <Image
                        src={panel.image.src}
                        width={panel.image.width}
                        height={panel.image.height}
                        alt={panel.image.alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {/* corner index chip */}
                    <span
                      className={`absolute -top-4 rounded-full border-[1.5px] border-ink px-3 py-1 font-mono text-[11px] tracking-[0.2em] uppercase ${
                        reverse ? "-left-3" : "-right-3"
                      }`}
                      style={{
                        background: `var(--${accent})`,
                        color: "var(--paper)",
                        boxShadow: "2px 2px 0 var(--ink)",
                        transform: "rotate(-3deg)",
                      }}
                    >
                      Fig · 0{index + 1}
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
