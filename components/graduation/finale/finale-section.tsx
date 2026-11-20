"use client";

import { useRef } from "react";
import type { RsvpAnswer } from "@/lib/graduation/types";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useCopy, useGradEvent } from "../i18n/lang-context";
import { RisoButton } from "@/components/ui/riso/button";
import { DownloadCardButton } from "../shared/download-card-button";
import { FINALE_ENVELOPE_SIZE } from "../shared/envelope-size";
import { SectionHeading } from "../shared/section-heading";
import { EnvelopeBody } from "../envelope/envelope-body";
import { EnvelopeFlap } from "../envelope/envelope-flap";
import { EnvelopePocket } from "../envelope/envelope-pocket";
import { FinaleReplyCard } from "./finale-reply-card";
import { useCountdown } from "./use-countdown";
import { useFinaleTimeline } from "./use-finale-timeline";

const pad = (n: number) => String(n).padStart(2, "0");

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-13 flex-col items-center rounded-lg border-[1.5px] border-ink bg-paper px-2.5 py-1.5 sm:px-3" style={{ boxShadow: "var(--offset-xs)" }}>
      <span className="font-heading text-2xl leading-none font-bold text-ink tabular-nums sm:text-3xl">{value}</span>
      <span className="text-[9px] tracking-[0.2em] text-ink-3 uppercase sm:text-[10px]">{label}</span>
    </div>
  );
}

const Dot = () => <span className="font-bold text-ink-3">·</span>;

export function FinaleSection({
  guestName,
  guestId,
  rsvp,
}: {
  guestName: string;
  guestId?: string;
  rsvp: RsvpAnswer | null;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { finale: t, footer: footerText, envelope: envCopy } = useCopy();
  const event = useGradEvent();
  const countdown = useCountdown(event.startUtc, event.endUtc);

  useFinaleTimeline(rootRef, !reduced);

  return (
    <section
      id="finale"
      ref={rootRef}
      className="relative bg-paper"
      style={{ height: reduced ? "100vh" : "220vh" }}
    >
      <div className="sticky top-0 box-border flex h-screen flex-col items-center justify-between overflow-hidden px-6 pt-[clamp(68px,8.5vh,88px)] pb-[clamp(16px,2.5vh,28px)] lg:px-[clamp(72px,8vw,128px)]">
        {/* Top: Section Heading & Real-time Countdown */}
        <div id="finaleHeader" className="relative z-10 flex flex-col items-center gap-3 text-center shrink-0">
          <SectionHeading size="cover" lead={t.heading.lead} accent={t.heading.accent} />

          {countdown?.phase === "before" && (
            <div className="flex items-center gap-1.5 font-mono sm:gap-3">
              <Cell value={String(countdown.days)} label={t.countdown.days} />
              <Dot />
              <Cell value={pad(countdown.hours)} label={t.countdown.hours} />
              <Dot />
              <Cell value={pad(countdown.minutes)} label={t.countdown.minutes} />
              <Dot />
              <Cell value={pad(countdown.seconds)} label={t.countdown.seconds} />
            </div>
          )}

          {countdown?.phase === "during" && (
            <span
              className="rounded-full border-[1.5px] border-ink bg-canary px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-(--on-canary) uppercase"
              style={{ boxShadow: "var(--offset-xs)" }}
            >
              {t.countdown.during}
            </span>
          )}

          {countdown?.phase === "after" && (
            <span
              className="rounded-full border-[1.5px] border-ink bg-paper-2 px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-ink-2 uppercase"
              style={{ boxShadow: "var(--offset-xs)" }}
            >
              {t.countdown.after}
            </span>
          )}
        </div>

        {/* Center: Envelope sealing stage */}
        <div id="finaleWrap" className={`${FINALE_ENVELOPE_SIZE} my-auto transform-3d`}>
          <EnvelopeBody id="finaleBody" />
          <EnvelopePocket
            id="finalePocket"
            label={envCopy.returnTo}
            senderName={guestName}
            subText={envCopy.guest}
            // Off to the side, clear of the seal that lands on the pocket's centre when the flap closes.
            labelPlacement="bottom-[8%] right-[6%] rotate-2"
          />
          <EnvelopeFlap id="finaleFlap" sealed={true} />
          <FinaleReplyCard
            id="finaleCard"
            guestName={guestName}
            rsvp={rsvp}
            className="absolute top-[6%] left-[5%] h-[88%] w-[90%]"
          />
        </div>

        {/* Bottom: Warm closing appreciation & Download invitation card; the narrator's bubble keeps off it */}
        <div id="finaleFooter" data-bubble-avoid className="flex flex-col items-center gap-3.5 text-center shrink-0">
          <p
            className="m-0 max-w-[44ch] font-heading text-[clamp(15px,1.6vw,18px)] leading-relaxed text-pretty text-ink-2"
            style={{ fontVariationSettings: '"wdth" 88' }}
          >
            {footerText}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {guestId && <DownloadCardButton guestId={guestId} guestName={guestName} label={t.downloadCard} />}
            <RisoButton
              variant="ink"
              size="md"
              onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              }
            >
              {t.backToTop}
            </RisoButton>
          </div>
        </div>
      </div>
    </section>
  );
}
