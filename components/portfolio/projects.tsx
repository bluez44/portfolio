"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { projects, type Project } from "@/lib/portfolio-data";

const PROJECT_ACCENTS = ["blue", "tomato"] as const;

export function Projects() {
  const headerRef = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="projects"
      className="relative px-6 py-[clamp(80px,10vw,140px)]"
    >
      <div className="mx-auto max-w-7xl">
        {/* section head */}
        <div ref={headerRef} className="mb-16 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
              04 · Projects
            </span>
            <span aria-hidden className="h-px flex-1 max-w-40 bg-ink/20" />
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2
              className="font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 5rem)",
                fontVariationSettings: '"wdth" 90, "opsz" 96',
              }}
            >
              Selected{" "}
              <span
                className="italic text-blue"
                style={{ fontVariationSettings: '"wdth" 82' }}
              >
                work.
              </span>
            </h2>
            <p className="max-w-md text-[16px] leading-[1.6] text-ink-2">
              Two case studies from the last twelve months — each shipped end
              to end, from architecture to interaction detail.
            </p>
          </div>
        </div>

        {/* project spreads */}
        <div className="flex flex-col gap-24 lg:gap-32">
          {projects.map((project, index) => (
            <ProjectSpread
              key={project.title}
              project={project}
              index={index}
              accent={PROJECT_ACCENTS[index % PROJECT_ACCENTS.length]}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSpread({
  project,
  index,
  accent,
  reverse,
}: {
  project: Project;
  index: number;
  accent: (typeof PROJECT_ACCENTS)[number];
  reverse: boolean;
}) {
  const spreadRef = useScrollReveal<HTMLElement>(true);

  return (
    <article
      ref={spreadRef}
      className={`grid gap-8 lg:gap-14 ${
        reverse ? "lg:grid-cols-[5fr_7fr]" : "lg:grid-cols-[7fr_5fr]"
      }`}
    >
      {/* poster panel */}
      <div
        className={`relative ${reverse ? "lg:order-2" : ""}`}
        style={{ aspectRatio: "4/3" }}
      >
        <div
          className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[var(--r-round)] border-[1.5px] border-ink p-8"
          style={{
            background: `var(--${accent})`,
            boxShadow: "8px 8px 0 var(--ink)",
          }}
        >
          {/* diagonal riso stripes */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              background:
                "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 22px)",
            }}
          />
          {/* halftone dots */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
            style={{
              background:
                "radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1.5px)",
              backgroundSize: "12px 12px",
            }}
          />
          <div className="relative z-10 flex items-start justify-between">
            <span className="font-mono text-[11px] tracking-[0.24em] text-paper/85 uppercase">
              Case · 0{index + 1}
            </span>
            <span
              className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-ink bg-paper font-mono text-[11px] font-bold text-ink"
              style={{ boxShadow: "2px 2px 0 var(--ink)" }}
            >
              0{index + 1}
            </span>
          </div>
          <div className="relative z-10">
            <h3
              className="font-heading font-bold leading-[0.92] tracking-[-0.03em] text-paper"
              style={{
                fontSize: "clamp(2.6rem, 6.5vw, 5.5rem)",
                fontVariationSettings: '"wdth" 82, "opsz" 96',
              }}
            >
              {project.title}
            </h3>
            <p className="mt-3 font-mono text-[11px] tracking-[0.2em] text-paper/80 uppercase">
              {project.tags.slice(0, 3).join(" · ")}
            </p>
          </div>
        </div>
      </div>

      {/* copy side */}
      <div
        className={`flex flex-col justify-center ${
          reverse ? "lg:order-1" : ""
        }`}
      >
        <div className="mb-4 flex items-baseline gap-4">
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
            / Project
          </span>
        </div>

        <h4
          className="mb-5 font-heading font-semibold leading-[1.05] tracking-[-0.02em] text-ink"
          style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}
        >
          {project.title}
        </h4>

        <p className="text-[17px] leading-[1.72] text-ink-2">{project.desc}</p>

        {/* tags — wrapped riso pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border-[1.5px] border-ink bg-paper px-3 py-1 font-mono text-[11px] tracking-[0.06em] text-ink"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* actions */}
        <div className="mt-8 flex flex-wrap items-center gap-5 border-t-[1.5px] border-ink/15 pt-5">
          <a
            href="#"
            className="riso-press inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper"
            style={{ boxShadow: `4px 4px 0 var(--${accent})` }}
          >
            Live Demo <span aria-hidden>↗</span>
          </a>
          <a
            href="#"
            className="text-[14px] font-semibold text-ink underline decoration-tomato decoration-[2px] underline-offset-[5px] transition-colors hover:text-tomato"
          >
            Source Code
          </a>
        </div>
      </div>
    </article>
  );
}
