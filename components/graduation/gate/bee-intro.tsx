"use client";

import { useEffect, useRef } from "react";
import { RisoButton } from "@/components/ui/riso/button";
import { playSfx } from "@/lib/graduation/sfx";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { LangToggle } from "../i18n/lang-toggle";
import { useCopy } from "../i18n/lang-context";
import { useBeeIntroScene } from "../intro/use-bee-intro-scene";
import type { GatePhase } from "./gate-phase";
import { useIntroTimeline } from "./use-intro-timeline";

const mono = "font-mono text-[10px] tracking-[0.22em] uppercase";
const bar = "absolute inset-x-0 z-8 box-border flex h-[clamp(44px,8vh,72px)] items-center justify-between gap-4 overflow-hidden bg-ink px-[clamp(16px,3vw,32px)]";

const Chars = ({ text }: { text: string }) =>
  [...text].map((ch, i) => (
    <span key={i} data-intro-char className="inline-block whitespace-pre">
      {ch}
    </span>
  ));

type Props = {
  guestName: string;
  phase: GatePhase;
  /** Returns false when the intro is not ready to open. */
  onEnter: (withMusic: boolean) => boolean;
  onExited: () => void;
};

/** The design's "bee" cinematic cover; `onEnter` must run inside the click for the music to start. */
export function BeeIntro({ guestName, phase, onEnter, onExited }: Props) {
  const { gate: t, header, stage, envelope } = useCopy();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const sceneRef = useBeeIntroScene(hostRef, { reduced, timecodeRef, grainRef, onFlap: () => playSfx("buzz") });
  const { exit } = useIntroTimeline(rootRef, reduced);

  useEffect(() => {
    if (phase === "ready") rootRef.current?.querySelector<HTMLButtonElement>("[data-intro-wake]")?.focus({ preventScroll: true });
  }, [phase]);

  const enter = (withMusic: boolean) => {
    if (!onEnter(withMusic)) return;
    const audible = withMusic && !reduced;
    exit(withMusic ? sceneRef.current : null, onExited, () => audible && playSfx("rustle"));
  };
  const waiting = phase !== "ready";

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" aria-label={t.dialogLabel} className="fixed inset-0 z-100 overflow-hidden bg-paper">
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(var(--halftone) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-155 w-155 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--tomato) 15%, transparent), transparent)" }} />
        <div className="absolute -right-45 -bottom-50 h-175 w-175 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--blue) 11%, transparent), transparent)" }} />
      </div>
      <div ref={hostRef} data-intro-backdrop aria-hidden onClick={() => enter(true)} className={`absolute inset-0 z-2 ${waiting ? "cursor-wait" : "cursor-pointer"}`} />
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0 z-4" style={{ background: "radial-gradient(ellipse 75% 70% at 55% 50%, transparent 55%, rgba(28,27,31,0.12) 100%)" }} />
      <div ref={grainRef} data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0 z-6 opacity-7 mix-blend-multiply" />

      <span data-intro-toast className="absolute inset-x-0 top-[calc(clamp(44px,8vh,72px)+64px)] z-7 translate-y-2 text-center font-mono text-[11px] tracking-[0.22em] text-jade uppercase opacity-0">
        {t.nowPlaying}
      </span>

      <div className="pointer-events-none absolute inset-x-[clamp(20px,5vw,72px)] bottom-[calc(clamp(44px,8vh,72px)+clamp(20px,5vh,56px))] z-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="flex min-w-0 flex-col gap-[clamp(10px,2vh,18px)]">
          <h1
            aria-label={`${stage.cover.lead} ${stage.cover.accent}`}
            className="m-0 font-heading text-[clamp(56px,11.5vw,184px)] leading-[0.86] font-bold tracking-[-0.045em] text-ink"
            style={{ fontVariationSettings: '"wdth" 82, "opsz" 96' }}
          >
            <span aria-hidden className="block overflow-hidden pb-[0.05em]">
              <Chars text={stage.cover.lead} />
            </span>
            <span aria-hidden className="block overflow-hidden pb-[0.1em] text-tomato italic" style={{ fontVariationSettings: '"wdth" 78, "opsz" 96' }}>
              <Chars text={stage.cover.accent} />
            </span>
          </h1>
          <div data-intro-fade className="flex flex-wrap items-baseline gap-3">
            <span className={`${mono} text-ink-3`}>{envelope.to}</span>
            <span className="font-heading text-[clamp(20px,2.4vw,30px)] font-semibold tracking-[-0.02em] whitespace-nowrap text-ink">{guestName}</span>
          </div>
        </div>
        <div data-intro-fade className="pointer-events-auto flex flex-col items-end gap-2.5">
          <RisoButton data-intro-wake variant="primary" size="lg" icon="→" disabled={waiting} onClick={() => enter(true)}>
            {phase === "arriving" ? t.preparing : t.wake}
          </RisoButton>
          <span className={`${mono} tracking-[0.16em] text-ink-3`}>{t.tapHint}</span>
        </div>
      </div>

      <div data-intro-bar="top" className={`${bar} top-0`}>
        <span className={`${mono} whitespace-nowrap text-paper`}>QV — {header.title}</span>
        <div className="flex items-center gap-4">
          <span aria-hidden className={`${mono} hidden items-center gap-2 text-paper sm:flex`}>
            <span className="h-1.75 w-1.75 rounded-full bg-tomato" />
            <span ref={timecodeRef} className="tabular-nums">
              00:00:00:00
            </span>
          </span>
          <LangToggle />
        </div>
      </div>
      <div data-intro-bar="bottom" className={`${bar} bottom-0`}>
        <button
          type="button"
          disabled={waiting}
          onClick={() => enter(false)}
          className="riso-focus cursor-pointer border-0 bg-transparent px-0 py-1.5 font-sans text-sm whitespace-nowrap text-paper underline underline-offset-4 hover:text-canary disabled:cursor-wait"
        >
          {t.silent}
        </button>
        <span className={`${mono} whitespace-nowrap text-paper`}>{t.soundHint}</span>
      </div>
    </div>
  );
}
