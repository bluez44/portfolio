"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { EnvelopeBack } from "./envelope-back";
import { EnvelopeFront } from "./envelope-front";
import { ENVELOPE_SIZE, ENVELOPE_WIDTH } from "../shared/envelope-size";
import { InvitationCard } from "./invitation-card";
import { ScrollHint } from "./scroll-hint";
import { StageKickers } from "./stage-kickers";
import { useEnvelopeTimeline } from "./use-envelope-timeline";

const Glows = () => (
  <>
    <div aria-hidden className="pointer-events-none absolute -top-30 -left-30 h-130 w-130 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--tomato) 18%, transparent), transparent)" }} />
    <div aria-hidden className="pointer-events-none absolute -right-35 -bottom-40 h-150 w-150 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--blue) 14%, transparent), transparent)" }} />
  </>
);

export function EnvelopeStage({ guestName }: { guestName: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEnvelopeTimeline(rootRef, !reduced);

  return (
    <section id="stage" ref={rootRef} tabIndex={-1} className="relative bg-paper outline-none" style={{ height: reduced ? "100svh" : "420vh" }}>
      <div className="sticky top-0 box-border flex h-svh flex-col items-center justify-center gap-[clamp(20px,3.5vh,40px)] overflow-hidden px-6 pt-22 pb-8 perspective-[1600px] min-[760px]:px-[clamp(72px,8vw,128px)]">
        <Glows />
        <StageKickers greetingVisible={reduced} />
        {reduced ? (
          <InvitationCard guestName={guestName} className={ENVELOPE_WIDTH} />
        ) : (
          <>
            <div id="envWrap" className={`${ENVELOPE_SIZE} transform-3d`} style={{ transform: "rotateX(14deg) rotateZ(-3deg)" }}>
              <div id="envFlip" className="absolute inset-0 transform-3d">
                <EnvelopeFront guestName={guestName} />
                <EnvelopeBack guestName={guestName} />
              </div>
            </div>
            <ScrollHint />
          </>
        )}
      </div>
    </section>
  );
}
