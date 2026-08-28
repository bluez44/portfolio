"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CanvasErrorBoundary } from "./canvas-error-boundary";
import { TechFocusPanel } from "./tech-focus-panel";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useHandTracking } from "@/lib/hooks/use-hand-tracking";
import { ACCENT_COLOR, chipTiers, techs, tierLegend } from "@/lib/portfolio-data";
import type { TechSceneHandle } from "./tech-scene";

const TechScene = dynamic(
  () => import("./tech-scene").then((mod) => mod.TechScene),
  { ssr: false },
);

const TIER_ACCENT = ["tomato", "blue", "jade"] as const;

function WebglFallback() {
  return (
    <div
      className="flex h-[clamp(360px,50vh,520px)] items-center justify-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, var(--paper-2) 0 12px, transparent 12px 24px)",
      }}
    >
      <p className="font-mono text-[13px] text-ink-2">
        [ 3D unavailable on this device — skills listed below ]
      </p>
    </div>
  );
}

export function Skills() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const chipsRef = useScrollReveal<HTMLDivElement>(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TechSceneHandle>(null);

  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { handOn, handStatus, toggleHands } = useHandTracking({
    sceneRef,
    focusedIndex,
    techCount: techs.length,
  });

  const focusedTech = focusedIndex !== null ? techs[focusedIndex] : null;

  return (
    <section
      id="skills"
      className="relative border-t-[1.5px] border-ink px-6 py-[clamp(80px,10vw,140px)]"
      style={{ background: "var(--paper-2)" }}
    >
      <div className="mx-auto max-w-7xl">
        {/* section head */}
        <div ref={headerRef} className="mb-14 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
              03 · Skills
            </span>
            <span aria-hidden className="h-px flex-1 max-w-40 bg-ink/20" />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <h2
              className="font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 5rem)",
                fontVariationSettings: '"wdth" 90, "opsz" 96',
              }}
            >
              The knowledge{" "}
              <span
                className="italic text-tomato"
                style={{ fontVariationSettings: '"wdth" 82' }}
              >
                garden.
              </span>
            </h2>
            <p className="max-w-md text-[16px] leading-[1.6] text-ink-2">
              A living map of my stack — foundations at the root, specialised
              tools at the crown. Drag to orbit, click a node or chip to inspect.
            </p>
          </div>

          {/* tier legend row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 border-t-[1.5px] border-ink/20 pt-4">
            {tierLegend.map((tier, i) => (
              <div key={tier.kicker} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-6 w-6 place-items-center rounded-full border-[1.5px] border-ink font-mono text-[10px] font-bold"
                  style={{
                    background: `var(--${TIER_ACCENT[TIER_ACCENT.length - 1 - i]})`,
                    color: "var(--paper)",
                  }}
                >
                  {3 - i}
                </span>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase">
                    {tier.kicker}
                  </p>
                  <p className="font-heading text-[14px] font-semibold text-ink">
                    {tier.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D orbit stage */}
        <div
          ref={wrapperRef}
          className="relative overflow-hidden rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper"
          style={{ boxShadow: "8px 8px 0 var(--ink)" }}
        >
          {/* subtle radial bloom */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 45%, color-mix(in oklab, var(--tomato) 12%, transparent) 0%, transparent 65%)",
            }}
          />
          <CanvasErrorBoundary fallback={<WebglFallback />}>
            <div className="relative h-[clamp(420px,62vh,640px)] cursor-grab [touch-action:pan-y]">
              <TechScene
                ref={sceneRef}
                techs={techs}
                accent={ACCENT_COLOR}
                reducedMotion={reducedMotion}
                visible={visible}
                focusedIndex={focusedIndex}
                onFocus={setFocusedIndex}
              />
            </div>
          </CanvasErrorBoundary>

          {focusedTech && (
            <TechFocusPanel
              tech={focusedTech}
              onClose={() => sceneRef.current?.closeFocus()}
            />
          )}

          {/* stage controls */}
          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3">
            <button
              onClick={toggleHands}
              aria-pressed={handOn}
              className="rounded-full border-[1.5px] border-ink px-4 py-2 text-[12px] font-semibold transition-transform hover:-translate-y-0.5"
              style={{
                background: handOn ? "var(--jade)" : "var(--paper)",
                color: handOn ? "var(--paper)" : "var(--ink)",
                boxShadow: "3px 3px 0 var(--ink)",
              }}
            >
              {handOn ? "✕ Hand control ON" : "◉ Enable hand control"}
            </button>
            {handStatus && (
              <p
                role="status"
                className="max-w-[320px] rounded-full border-[1.5px] border-ink bg-paper px-3 py-1.5 text-[11px] text-ink-2"
              >
                {handStatus}
              </p>
            )}
          </div>
        </div>

        {/* chip clusters */}
        <div ref={chipsRef} className="mt-10 flex flex-col gap-6">
          {chipTiers.map((tier, tierIdx) => {
            const accent = TIER_ACCENT[tierIdx];
            return (
              <div
                key={tier.name}
                className="flex flex-wrap items-center gap-3"
              >
                <p
                  className="flex w-36 flex-none items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-ink-2 uppercase"
                >
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full border-[1.5px] border-ink"
                    style={{ background: `var(--${accent})` }}
                  />
                  {tier.name}
                </p>
                {tier.items.map((item) => (
                  <button
                    key={item.index}
                    onClick={() => sceneRef.current?.focusTech(item.index)}
                    className="rounded-full border-[1.5px] border-ink bg-paper px-4 py-2 text-[13px] font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5"
                    style={{ boxShadow: `2px 2px 0 var(--${accent})` }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
