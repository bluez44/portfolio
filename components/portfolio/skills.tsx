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

function WebglFallback() {
  return (
    <div
      className="flex h-[clamp(360px,50vh,520px)] items-center justify-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, var(--panel) 0 12px, transparent 12px 24px)",
      }}
    >
      <p className="font-mono text-[13px] text-muted">
        [ 3D unavailable on this device — skills listed below ]
      </p>
    </div>
  );
}

export function Skills() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const chipsRef = useScrollReveal<HTMLDivElement>(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TechSceneHandle>(null);

  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

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
      className="border-y border-line px-6 py-[clamp(72px,10vw,120px)]"
      style={{ background: "var(--bg2)" }}
    >
      <div className="mx-auto max-w-280">
        <div ref={revealRef}>
          <p className="mb-2.5 font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
            02 / Skills
          </p>
          <h2 className="mb-3 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
            The knowledge path
          </h2>
          <p className="mb-8 max-w-150 text-[15.5px] leading-[1.7] text-muted">
            A living map of my stack — foundations at the root, specialized
            tools at the crown. Drag to orbit, click a node (or a chip below)
            to inspect it.
          </p>
        </div>

        <div
          ref={wrapperRef}
          className="relative overflow-hidden rounded-2xl border border-panel-border bg-bg"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, var(--accent-dim) 0%, transparent 55%)",
          }}
        >
          <CanvasErrorBoundary fallback={<WebglFallback />}>
            <div className="h-[clamp(420px,62vh,640px)] cursor-grab [touch-action:pan-y]">
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

          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-5 hidden -translate-y-1/2 flex-col gap-11 md:flex"
          >
            {tierLegend.map((tier) => (
              <div key={tier.kicker} className="flex items-center gap-2.5">
                <span className="h-px w-5.5 bg-accent opacity-60" />
                <div>
                  <p className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
                    {tier.kicker}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">{tier.name}</p>
                </div>
              </div>
            ))}
          </div>

          {focusedTech && (
            <TechFocusPanel
              tech={focusedTech}
              onClose={() => sceneRef.current?.closeFocus()}
            />
          )}

          <div className="absolute bottom-3.5 left-4 flex flex-wrap items-center gap-2.5">
            <button
              onClick={toggleHands}
              aria-pressed={handOn}
              className="rounded-full border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition hover:border-accent hover:text-accent"
              style={{
                borderColor: handOn ? "var(--accent)" : "var(--panel-border)",
                background: handOn ? "var(--accent-dim)" : "var(--panel-strong)",
                color: handOn ? "var(--accent)" : "var(--muted)",
              }}
            >
              {handOn ? "✕ Disable hand control" : "Enable hand control (webcam)"}
            </button>
            {handStatus && (
              <p role="status" className="max-w-[320px] text-xs text-muted">
                {handStatus}
              </p>
            )}
          </div>
        </div>

        <div ref={chipsRef} className="mt-7 flex flex-col gap-4">
          {chipTiers.map((tier) => (
            <div key={tier.name} className="flex flex-wrap items-center gap-2.5">
              <p className="w-30 flex-none font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                {tier.name}
              </p>
              {tier.items.map((item) => (
                <button
                  key={item.index}
                  onClick={() => sceneRef.current?.focusTech(item.index)}
                  className="rounded-full border border-panel-border bg-chip px-3.75 py-2 text-[13px] font-medium transition hover:border-accent hover:shadow-[0_0_14px_var(--glow)]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
