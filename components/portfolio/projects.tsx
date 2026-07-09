"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { projects, type Project } from "@/lib/portfolio-data";

const ACCENT_GLOW = "rgba(61, 139, 255, 0.30)";

export function Projects() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const progress = progressRef.current;
    if (!viewport || !progress) return;

    const onScroll = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      const pct = max > 0 ? (viewport.scrollLeft / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="projects"
      className="relative overflow-hidden py-[clamp(72px,8vw,100px)]"
    >
      <div className="mx-auto max-w-280 px-6">
        <p className="mb-2.5 font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          03 / Projects
        </p>
        <h2 className="font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          Selected work
        </h2>
        <p className="mt-2.5 text-sm text-muted">
          Keep scrolling — the gallery glides sideways.
        </p>
      </div>
      <div
        ref={viewportRef}
        className="overflow-x-auto px-6 py-8 [-webkit-overflow-scrolling:touch] overscroll-x-contain scrollbar-none"
      >
        <div className="flex w-max items-stretch gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-280 px-6">
        <div className="h-0.5 max-w-[320px] overflow-hidden rounded-full bg-line">
          <div
            ref={progressRef}
            className="h-full w-0 bg-accent shadow-[0_0_8px_var(--glow)]"
          />
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement>(null);

  const onEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -6,
      boxShadow: `0 14px 40px rgba(0,0,0,.28), 0 0 24px ${ACCENT_GLOW}`,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const onLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.45,
      ease: "power2.out",
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex w-[min(400px,80vw)] flex-none flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel backdrop-blur-sm"
    >
      <div
        role="img"
        aria-label="Project preview placeholder"
        className="relative aspect-video overflow-hidden border-b border-line"
      >
        <div
          className="absolute inset-y-0 -inset-x-8 flex items-center justify-center bg-bg2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--chip) 0 12px, transparent 12px 24px)",
          }}
        >
          <span className="font-mono text-[11.5px] tracking-[0.08em] text-muted">
            [ project preview ]
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5.5">
        <h3 className="font-heading text-[19px] font-semibold">{project.title}</h3>
        <p className="mt-2.5 text-sm leading-[1.65] text-muted">{project.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-dim px-2.75 py-1 font-mono text-[11px] tracking-[0.04em] text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex gap-4.5 border-t border-line pt-4.5">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent"
          >
            Live Demo <span aria-hidden>↗</span>
          </a>
          <a
            href="#"
            className="text-[13.5px] font-semibold text-muted transition-colors hover:text-accent"
          >
            Source Code
          </a>
        </div>
      </div>
    </article>
  );
}
