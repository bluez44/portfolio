"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CanvasErrorBoundary } from "./canvas-error-boundary";

const HeroScene = dynamic(
  () => import("./hero-scene").then((mod) => mod.HeroScene),
  { ssr: false },
);

const ROLES = ["Fullstack Developer", "Frontend Developer", "Fulltime Dreamer"];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
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

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(
      () => setRoleIndex((i) => (i + 1) % ROLES.length),
      2600,
    );
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* 3D bg — subtle grid + particle mist */}
      <CanvasErrorBoundary fallback={null}>
        <HeroScene
          accent="#7a7a83"
          visible={visible}
          reducedMotion={reducedMotion}
        />
      </CanvasErrorBoundary>

      {/* atmospheric vignette to soften the grid edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 55% 40%, transparent 25%, var(--paper) 92%)",
        }}
      />

      {/* grand entrance — one-time halftone sweep on load */}
      {!reducedMotion && <div aria-hidden className="grand-entrance" />}

      {/* soft tomato bloom top-right — atmosphere without more halftone */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-[70vh] w-[55vw] opacity-30"
        style={{
          background:
            "radial-gradient(circle at 80% 30%, color-mix(in oklab, var(--tomato) 30%, transparent), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[50vh] w-[45vw] opacity-25"
        style={{
          background:
            "radial-gradient(circle at 20% 70%, color-mix(in oklab, var(--blue) 25%, transparent), transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 pt-32 pb-24">
        {/* editorial index label */}
        <div
          className="reveal flex items-center gap-3"
          style={{ animationDelay: "80ms" }}
        >
          <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
            01 · Intro
          </span>
          <span aria-hidden className="h-px flex-1 max-w-40 bg-ink/25" />
        </div>

        {/* availability ribbon */}
        <div
          className="reveal mt-6 self-start"
          style={{ animationDelay: "160ms" }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-jade px-4 py-1.5 text-[12px] font-semibold tracking-[0.16em] text-paper uppercase"
            style={{
              boxShadow: "3px 3px 0 var(--ink)",
              transform: "rotate(-3deg)",
            }}
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-paper"
              style={{ animation: "pulse-dot 2.2s ease-in-out infinite" }}
            />
            Available for work · 2026
          </span>
        </div>

        {/* massive display headline */}
        <h1
          className="reveal mt-10 font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
          style={{
            animationDelay: "260ms",
            fontSize: "clamp(3rem, 9vw, 7.5rem)",
            fontVariationSettings: '"wdth" 88, "opsz" 96',
          }}
        >
          <span className="block">Hi, I&apos;m</span>
          <span className="relative inline-block">
            <span
              aria-hidden
              className="absolute -inset-x-2 bottom-[10%] -z-0 h-[38%] bg-canary"
              style={{ transform: "rotate(-1deg)" }}
            />
            <span className="relative z-10 text-ink">Quang Vinh.</span>
          </span>
        </h1>

        {/* rotating role — no typewriter, just soft fade */}
        <p
          className="reveal mt-4 font-heading text-tomato font-medium"
          style={{
            animationDelay: "360ms",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
          }}
          aria-live="polite"
        >
          <span
            key={roleIndex}
            className="inline-block"
            style={{
              animation: reducedMotion
                ? "none"
                : "ink-drop 480ms var(--ease) both",
            }}
          >
            {ROLES[roleIndex]}
          </span>
          <span className="text-ink-3"> —</span>
        </p>

        {/* supporting paragraph */}
        <p
          className="reveal mt-8 max-w-xl text-[17px] leading-[1.65] text-ink-2"
          style={{ animationDelay: "460ms" }}
        >
          Fullstack Software Engineer crafting fast, scalable web and mobile
          applications. I care about clean architecture, generous typography,
          and interfaces that don&apos;t feel like everyone else&apos;s.
        </p>

        {/* CTAs — riso offset shadow, no glow */}
        <div
          className="reveal mt-10 flex flex-wrap items-center gap-4"
          style={{ animationDelay: "560ms" }}
        >
          <a
            href="#projects"
            className="riso-press inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-ink bg-tomato px-7 py-3.5 text-[15px] font-semibold text-paper"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            View Projects
            <span aria-hidden>→</span>
          </a>
          <a
            href="#contact"
            className="riso-press inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-ink bg-paper px-7 py-3.5 text-[15px] font-semibold text-ink"
            style={{ boxShadow: "5px 5px 0 var(--blue)" }}
          >
            Contact Me
          </a>
          <a
            href="/Resume - Vo Le Quang Vinh.pdf"
            download
            className="ml-1 hidden text-[14px] font-medium text-ink-2 underline decoration-tomato decoration-[2px] underline-offset-[6px] hover:text-ink sm:inline-block"
          >
            or grab the CV ↓
          </a>
        </div>

        {/* meta strip */}
        <div
          className="reveal mt-16 flex flex-wrap items-end justify-between gap-6 border-t-[1.5px] border-ink/20 pt-5"
          style={{ animationDelay: "680ms" }}
        >
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { k: "Based", v: "Ho Chi Minh City, VN" },
              { k: "Stack", v: "React · Next · Vue · React Native" },
              { k: "Currently", v: "@ TalentGetGo" },
            ].map((item) => (
              <div key={item.k} className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase">
                  {item.k}
                </span>
                <span className="font-heading text-[15px] font-semibold text-ink">
                  {item.v}
                </span>
              </div>
            ))}
          </div>
          <a
            href="#about"
            aria-label="Scroll to About"
            className="group flex items-center gap-3 font-mono text-[11px] tracking-[0.24em] text-ink-2 uppercase transition-colors hover:text-tomato"
          >
            Scroll
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-ink text-ink transition-transform group-hover:translate-y-1"
              style={{ boxShadow: "2px 2px 0 var(--ink)" }}
            >
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
