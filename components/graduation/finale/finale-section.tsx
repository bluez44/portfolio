"use client";

import { useRef } from "react";
import type { RsvpAnswer } from "@/lib/graduation/types";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useCopy } from "../i18n/lang-context";
import { SectionHeading } from "../shared/section-heading";
import { EnvelopeBody } from "../envelope/envelope-body";
import { EnvelopeFlap } from "../envelope/envelope-flap";
import { EnvelopePocket } from "../envelope/envelope-pocket";
import { FinaleReplyCard } from "./finale-reply-card";
import { useCountdown } from "./use-countdown";
import { useFinaleTimeline } from "./use-finale-timeline";

const ENVELOPE_SIZE = "relative aspect-[1.6/1] w-[min(540px,88vw)] min-[760px]:w-[min(540px,46vw)]";

export function FinaleSection({
  guestName,
  rsvp,
}: {
  guestName: string;
  rsvp: RsvpAnswer | null;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { finale: t, footer: footerText, envelope: envCopy } = useCopy();
  const countdown = useCountdown();

  useFinaleTimeline(rootRef, !reduced);

  return (
    <section
      id="finale"
      ref={rootRef}
      className="relative border-t-[1.5px] border-ink bg-paper"
      style={{ height: reduced ? "100vh" : "220vh" }}
    >
      <div className="sticky top-0 box-border flex h-screen flex-col items-center justify-between overflow-hidden px-6 pt-[clamp(80px,11vh,104px)] pb-[clamp(20px,3.5vh,36px)] min-[760px]:px-[clamp(72px,8vw,128px)]">
        {/* Top: Section Heading & Real-time Countdown (sits on top of the open flap) */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center shrink-0">
          <SectionHeading lead={t.heading.lead} accent={t.heading.accent} />

          {countdown.phase === "before" && (
            <div className="flex items-center gap-2 font-mono min-[420px]:gap-3">
              <div
                className="flex flex-col items-center rounded-lg border-[1.5px] border-ink bg-paper px-3 py-1.5"
                style={{ boxShadow: "var(--offset-xs)" }}
              >
                <span className="font-heading text-2xl font-bold leading-none text-ink min-[420px]:text-3xl">
                  {countdown.days}
                </span>
                <span className="text-[9px] tracking-[0.2em] text-ink-3 uppercase min-[420px]:text-[10px]">
                  {t.countdown.days}
                </span>
              </div>
              <span className="font-bold text-ink-3">·</span>
              <div
                className="flex flex-col items-center rounded-lg border-[1.5px] border-ink bg-paper px-3 py-1.5"
                style={{ boxShadow: "var(--offset-xs)" }}
              >
                <span className="font-heading text-2xl font-bold leading-none text-ink min-[420px]:text-3xl">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] tracking-[0.2em] text-ink-3 uppercase min-[420px]:text-[10px]">
                  {t.countdown.hours}
                </span>
              </div>
              <span className="font-bold text-ink-3">·</span>
              <div
                className="flex flex-col items-center rounded-lg border-[1.5px] border-ink bg-paper px-3 py-1.5"
                style={{ boxShadow: "var(--offset-xs)" }}
              >
                <span className="font-heading text-2xl font-bold leading-none text-ink min-[420px]:text-3xl">
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] tracking-[0.2em] text-ink-3 uppercase min-[420px]:text-[10px]">
                  {t.countdown.minutes}
                </span>
              </div>
            </div>
          )}

          {countdown.phase === "during" && (
            <span
              className="rounded-full border-[1.5px] border-ink bg-canary px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-ink uppercase"
              style={{ boxShadow: "var(--offset-xs)" }}
            >
              {t.countdown.during}
            </span>
          )}

          {countdown.phase === "after" && (
            <span
              className="rounded-full border-[1.5px] border-ink bg-paper-2 px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-ink-2 uppercase"
              style={{ boxShadow: "var(--offset-xs)" }}
            >
              {t.countdown.after}
            </span>
          )}
        </div>

        {/* Center: Envelope sealing stage */}
        <div id="finaleWrap" className={`${ENVELOPE_SIZE} my-auto transform-3d`}>
          <EnvelopeBody id="finaleBody" />
          <EnvelopePocket
            id="finalePocket"
            label={envCopy.returnTo}
            senderName={guestName}
            subText="Khách mời · Guest"
          />
          <EnvelopeFlap id="finaleFlap" sealed={true} />
          <FinaleReplyCard
            id="finaleCard"
            guestName={guestName}
            rsvp={rsvp}
            className="absolute top-[6%] left-[5%] h-[88%] w-[90%]"
          />
        </div>

        {/* Bottom: Warm closing appreciation */}
        <div className="flex flex-col items-center gap-2 text-center shrink-0">
          <p
            className="m-0 max-w-[44ch] font-heading text-[clamp(15px,1.6vw,18px)] leading-relaxed text-pretty text-ink-2"
            style={{ fontVariationSettings: '"wdth" 88' }}
          >
            {footerText}
          </p>
          {/* {!reduced && (
            <span className="font-mono text-[9px] tracking-[0.24em] text-ink-3 uppercase">
              [ Cuộn để niêm phong thư · Scroll to seal ]
            </span>
          )} */}
        </div>
      </div>
    </section>
  );
}
