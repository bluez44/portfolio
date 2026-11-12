"use client";

import { useCopy } from "../i18n/lang-context";
import type { RsvpAnswer } from "@/lib/graduation/types";

export function FinaleReplyCard({
  guestName,
  rsvp,
  id = "finaleCard",
  className = "",
}: {
  guestName: string;
  rsvp: RsvpAnswer | null;
  id?: string;
  className?: string;
}) {
  const { finale: t, rsvp: rsvpCopy } = useCopy();

  return (
    <div
      id={id}
      className={`box-border flex flex-col justify-between overflow-hidden rounded-[14px] border-[1.5px] border-ink bg-paper p-[clamp(16px,2.4vw,28px)] ${className}`}
      style={{
        boxShadow: "var(--offset-md)",
        backgroundImage: "linear-gradient(var(--paper-2) 1px, transparent 1px)",
        backgroundSize: "100% 28px",
      }}
    >
      <div className="flex items-center justify-between border-b border-dashed border-ink/20 pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[9px] font-bold tracking-[0.22em] text-ink uppercase">
            {t.replyOf(guestName)}
          </span>
          <span className="font-mono text-[8px] tracking-[0.18em] text-ink-3 uppercase">
            {rsvpCopy.letter.to}
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-[0.18em] text-tomato uppercase font-bold">
          QV · 2026
        </span>
      </div>

      <div className="my-auto flex flex-col items-center gap-2.5 py-3 text-center">
        {rsvp ? (
          <>
            <span
              className={`inline-block rounded-full border-[1.5px] border-ink px-3 py-1 font-mono text-[11px] font-bold tracking-[0.14em] uppercase ${
                rsvp.status === "yes" ? "bg-jade text-paper" : "bg-tomato text-paper"
              }`}
              style={{ boxShadow: "1px 1px 0 var(--ink)" }}
            >
              {rsvp.status === "yes" ? t.status.yes : t.status.no}
            </span>
            {rsvp.wish && (
              <p
                className="m-0 max-w-[34ch] font-heading text-[15px] italic leading-snug text-ink text-balance"
                style={{ fontVariationSettings: '"wdth" 88' }}
              >
                “{rsvp.wish}”
              </p>
            )}
          </>
        ) : (
          <>
            <span className="font-mono text-[12px] tracking-[0.16em] text-ink-3 uppercase">
              {t.noReply}
            </span>
            <a
              href="#rsvp"
              className="riso-focus inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-canary px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-ink uppercase no-underline transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: "var(--offset-xs)" }}
            >
              {t.replyNow}
            </a>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-ink/20 pt-2 font-mono text-[9px] tracking-[0.2em] text-ink-3 uppercase">
        <span>HCMUT</span>
        <span>28.11.2026</span>
      </div>
    </div>
  );
}
