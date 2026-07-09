"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CanvasErrorBoundary } from "./canvas-error-boundary";
import { ACCENT_COLOR } from "@/lib/portfolio-data";

const HeroScene = dynamic(
  () => import("./hero-scene").then((mod) => mod.HeroScene),
  { ssr: false },
);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Reading matchMedia is a browser-only API unavailable during SSR, so this value
    // can only be determined after mount. This intentional state update in an effect
    // is necessary to avoid a client/server mismatch. See react-hooks/set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.02 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <CanvasErrorBoundary fallback={null}>
        <HeroScene
          accent={ACCENT_COLOR}
          visible={visible}
          reducedMotion={reducedMotion}
        />
      </CanvasErrorBoundary>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, transparent 30%, var(--bg) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-280 px-6 pt-30 pb-20">
        <p className="mb-4.5 flex items-center font-mono text-[13px] tracking-[0.18em] text-accent uppercase">
          <span
            aria-hidden
            className="mr-2.5 inline-block h-1.75 w-1.75 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]"
            style={{ animation: "pulse-dot 2.4s ease-in-out infinite" }}
          />
          Available for work
        </p>
        <h1 className="font-heading text-[clamp(2.7rem,7.5vw,5.4rem)] leading-[1.04] font-bold tracking-[-0.02em]">
          Vo Le Quang Vinh
        </h1>
        <p className="mt-4.5 font-heading text-[clamp(1.25rem,2.6vw,1.8rem)] font-medium text-accent">
          Fullstack Developer
        </p>
        <p className="mt-5.5 max-w-140 text-[clamp(1rem,1.6vw,1.125rem)] leading-[1.7] text-muted">
          Fullstack Software Engineer crafting fast, scalable web and mobile
          applications with a focus on clean architecture and intuitive user
          experiences.
        </p>
        <div className="mt-9.5 flex flex-wrap gap-3.5">
          <a
            href="#projects"
            className="rounded-lg bg-accent px-6.5 py-3.25 text-[15px] font-semibold text-white shadow-[0_0_24px_var(--glow)] transition hover:-translate-y-0.5 hover:shadow-[0_0_36px_var(--glow)]"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="rounded-lg border border-panel-border bg-panel px-6.5 py-3.25 text-[15px] font-semibold backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            Contact Me
          </a>
        </div>
      </div>
      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[12px] tracking-[0.2em] text-muted uppercase"
      >
        scroll
        <span className="relative block h-12.5 w-7.5 rounded-full border border-muted">
          <span
            aria-hidden
            className="animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8.5 w-1.25 rounded-b-full rounded-t-full"
            style={{ background: "linear-gradient(white, transparent)" }}
          />
        </span>
      </a>
    </section>
  );
}
