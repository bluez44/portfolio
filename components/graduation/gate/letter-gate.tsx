"use client";

import { useEffect, useRef } from "react";
import { HalftoneBackdrop } from "@/components/ui/halftone-backdrop";
import { playSfx } from "@/lib/graduation/sfx";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { EnvelopeBody } from "../envelope/envelope-body";
import { EnvelopeFlap } from "../envelope/envelope-flap";
import { useCopy } from "../i18n/lang-context";
import { WaxSeal } from "../shared/wax-seal";
import { useLetterGate } from "./use-letter-gate";

const OPEN_MS = 900;

/** "You've got mail": a sealed envelope whose seal is the user activation that starts the music. */
export function LetterGate({ ready, onOpen, onOpened }: { ready: boolean; onOpen: () => void; onOpened: () => void }) {
  const { gate: t } = useCopy();
  const reduced = useReducedMotion();
  const { phase, open } = useLetterGate(ready, { animate: !reduced, openMs: OPEN_MS });
  const sealRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase === "ready") sealRef.current?.focus({ preventScroll: true });
    if (phase === "done") onOpened();
  }, [phase, onOpened]);

  if (phase === "done") return null;

  const opening = phase === "opening";
  const handleOpen = () => {
    if (phase !== "ready") return;
    onOpen();
    if (!reduced) {
      playSfx("crack");
      playSfx("rustle", 0.15);
    }
    open();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.youHaveMail}
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center gap-[clamp(24px,5vh,48px)] bg-paper px-6 ${
        opening ? "pointer-events-none animate-[gate-out_0.9s_ease-in_both]" : ""
      }`}
    >
      <HalftoneBackdrop />
      <p className="relative m-0 font-heading text-[clamp(32px,6vw,56px)] leading-none font-bold tracking-[-0.03em] text-ink">
        {t.youHaveMail}
      </p>
      <div className="relative aspect-[1.6/1] w-[min(420px,80vw)] motion-safe:animate-[gate-drop_0.8s_cubic-bezier(0.22,1,0.36,1)_both]">
        <EnvelopeBody />
        <EnvelopeFlap id="gateFlap" sealed={false} />
        <button
          ref={sealRef}
          type="button"
          onClick={handleOpen}
          disabled={phase !== "ready"}
          aria-label={t.tapToOpen}
          className="riso-focus absolute top-[54%] left-1/2 z-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-0 bg-transparent p-0 disabled:cursor-wait"
        >
          {phase === "ready" && (
            <span aria-hidden className="absolute -inset-2 rounded-full border-[1.5px] border-tomato motion-safe:animate-[pulse-dot_1.4s_ease-in-out_infinite]" />
          )}
          <WaxSeal split={opening} className="relative" />
        </button>
      </div>
      <p aria-live="polite" className="relative m-0 font-mono text-[12px] tracking-[0.22em] text-ink-2 uppercase">
        {phase === "arriving" ? t.preparing : t.tapToOpen}
      </p>
    </div>
  );
}
