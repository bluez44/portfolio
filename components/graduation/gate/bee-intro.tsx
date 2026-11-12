"use client";

import { Fragment, useEffect, useRef } from "react";
import { playSfx, unlockSfx } from "@/lib/graduation/sfx";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { LangToggle } from "../i18n/lang-toggle";
import { useCopy } from "../i18n/lang-context";
import { useBeeIntroScene } from "../intro/use-bee-intro-scene";
import { BeeBubble, type BeeBubbleHandle } from "./bee-bubble";
import { BeePulse, type BeePulseHandle } from "./bee-pulse";
import type { GatePhase } from "./gate-phase";
import { PENDING, useIntroTimeline } from "./use-intro-timeline";

const mono = "font-mono text-[10px] tracking-[0.22em] uppercase";
const bar = "absolute inset-x-0 z-8 box-content flex h-[clamp(44px,8vh,72px)] items-center justify-between gap-4 overflow-hidden bg-ink px-[clamp(16px,3vw,32px)]";

const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const graphemes = (word: string) => (segmenter ? [...segmenter.segment(word)].map((s) => s.segment) : [...word]);

/** One span per letter for the entrance, grouped per word so a line can only wrap between words. */
const Chars = ({ text }: { text: string }) =>
  text
    .normalize("NFC")
    .split(" ")
    .map((word, w) => (
      <Fragment key={w}>
        {w > 0 && " "}
        <span className="inline-block whitespace-nowrap">
          {graphemes(word).map((ch, i) => (
            <span key={i} data-intro-char className="inline-block">
              {ch}
            </span>
          ))}
        </span>
      </Fragment>
    ));

type Props = {
  guestName: string;
  phase: GatePhase;
  /** Returns false when the intro is not ready to open. */
  onEnter: (withMusic: boolean) => boolean;
  onExited: () => void;
  /** The "now playing" toast only speaks once the track has actually started. */
  musicPlaying: boolean;
};

/** The design's "bee" cinematic cover; `onEnter` must run inside the click for the music to start. */
export function BeeIntro({ guestName, phase, musicPlaying, onEnter, onExited }: Props) {
  const { gate: t, header, stage, envelope } = useCopy();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<BeeBubbleHandle>(null);
  const pulseRef = useRef<BeePulseHandle>(null);
  const sceneRef = useBeeIntroScene(hostRef, {
    reduced,
    timecodeRef,
    grainRef,
    onFlap: () => playSfx("buzz"),
    onPosition: (pos) => {
      bubbleRef.current?.update(pos, phase !== "opening");
      pulseRef.current?.update(pos.head, phase === "ready");
    },
  });
  const { exit, entered } = useIntroTimeline(rootRef, reduced);

  useEffect(() => {
    if (phase !== "ready" || !(entered || reduced)) return;
    // Without WebGL there is no bee to follow, so the tap target waits in the middle of the frame.
    if (!sceneRef.current) pulseRef.current?.update({ x: innerWidth / 2, y: innerHeight / 2, r: 32 }, true);
    // Focus the dialog, not the bee: programmatic focus would paint the bee's keyboard ring for every visitor. Tab reaches it next.
    rootRef.current?.focus({ preventScroll: true });
  }, [phase, entered, reduced, sceneRef]);

  const enter = (withMusic: boolean) => {
    if (!onEnter(withMusic)) return;
    bubbleRef.current?.update({ x: 0, y: 0 }, false);
    pulseRef.current?.update({ x: 0, y: 0, r: 0 }, false);
    const audible = withMusic && !reduced;
    if (audible) unlockSfx();
    exit(withMusic ? sceneRef.current : null, onExited, () => audible && playSfx("rustle"));
  };
  const waiting = phase !== "ready";

  return (
    <div ref={rootRef} {...{ [PENDING]: "" }} role="dialog" aria-modal="true" aria-label={t.dialogLabel} tabIndex={-1}
      // Children opt back in with pointer-events-auto, so the whole subtree is switched off once the exit runs.
      className={`fixed inset-0 z-100 overflow-hidden bg-paper outline-none ${phase === "opening" ? "pointer-events-none **:pointer-events-none" : ""}`}
    >
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(var(--halftone) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-155 w-155 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--tomato) 15%, transparent), transparent)" }} />
        <div className="absolute -right-45 -bottom-50 h-175 w-175 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--blue) 11%, transparent), transparent)" }} />
      </div>
      <div ref={hostRef} data-intro-backdrop aria-hidden onClick={() => enter(true)} className={`absolute inset-0 z-2 ${waiting ? "cursor-wait" : "cursor-pointer"}`} />
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0 z-4" style={{ background: "radial-gradient(ellipse 75% 70% at 55% 50%, transparent 55%, rgba(28,27,31,0.12) 100%)" }} />
      <div ref={grainRef} data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0 z-6 opacity-7 mix-blend-multiply" />

      <span data-intro-toast className="absolute inset-x-0 top-[calc(clamp(44px,8vh,72px)+64px)] z-7 translate-y-2 text-center font-mono text-[11px] tracking-[0.22em] text-jade uppercase opacity-0">
        {musicPlaying ? t.nowPlaying : null}
      </span>

      <BeeBubble ref={bubbleRef} guestName={guestName} />
      <BeePulse ref={pulseRef} label={t.wake} cue={t.tapBee} onPress={() => enter(true)} />

      {phase === "arriving" && (
        <p
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-[calc(clamp(44px,8vh,72px)+env(safe-area-inset-bottom)+clamp(10px,2vh,18px))] z-7 m-0 text-center font-mono text-[11px] tracking-[0.22em] text-ink-3 uppercase motion-safe:animate-pulse"
        >
          {t.preparing}
        </p>
      )}

      <div className="pointer-events-none absolute inset-x-[clamp(20px,5vw,72px)] bottom-[calc(clamp(44px,8vh,72px)+clamp(36px,7vh,72px))] z-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="flex min-w-0 flex-col gap-[clamp(10px,2vh,18px)] max-sm:w-full">
          <h1
            aria-label={`${stage.cover.lead} ${stage.cover.accent}`}
            className="m-0 font-heading text-[clamp(56px,11.5vw,184px)] leading-[0.86] font-bold tracking-[-0.045em] text-ink"
            style={{ fontVariationSettings: '"wdth" 82, "opsz" 96' }}
          >
            <span aria-hidden className="relative z-1 mt-[-0.3em] block overflow-hidden pt-[0.3em] pb-[0.05em]">
              <Chars text={stage.cover.lead} />
            </span>
            <span aria-hidden className="mt-[-0.3em] block overflow-hidden pt-[0.3em] pb-[0.1em] text-tomato italic" style={{ fontVariationSettings: '"wdth" 78, "opsz" 96' }}>
              <Chars text={stage.cover.accent} />
            </span>
          </h1>
          <div data-intro-fade className="flex flex-wrap items-baseline gap-3 max-sm:justify-end">
            <span className={`${mono} text-ink-3`}>{envelope.to}</span>
            <span className="font-heading text-[clamp(20px,2.4vw,30px)] font-semibold min-w-0 tracking-[-0.02em] text-ink wrap-anywhere">{guestName}</span>
          </div>
        </div>
      </div>

      <div data-intro-bar="top" className={`${bar} top-0 pt-[env(safe-area-inset-top)]`}>
        <span className={`${mono} whitespace-nowrap text-paper`}>{header.title}</span>
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
      <div data-intro-bar="bottom" className={`${bar} bottom-0 pb-[env(safe-area-inset-bottom)]`}>
        <button
          type="button"
          disabled={waiting}
          onClick={() => enter(false)}
          className="riso-focus hit-area relative cursor-pointer border-0 bg-transparent px-0 py-1.5 font-sans text-sm whitespace-nowrap text-paper underline underline-offset-4 hover:text-canary disabled:cursor-wait"
        >
          {t.silent}
        </button>
        <span className={`${mono} whitespace-nowrap text-paper`}>{t.soundHint}</span>
      </div>
    </div>
  );
}
