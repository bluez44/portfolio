"use client";

import type { ReactNode } from "react";
import { Postmark } from "../shared/postmark";
import { Stamp } from "../shared/stamp";
import { useCopy } from "../i18n/lang-context";

type Props = {
  guestName: string;
  postmarked?: boolean;
  children: ReactNode;
};

/**
 * Postcard frame styling for the RSVP form and its response.
 * Uses index card horizontal lines and airmail-inspired typography.
 */
export function ReplyPostcard({ guestName, postmarked = false, children }: Props) {
  const { rsvp: t } = useCopy();

  return (
    <div
      className="relative rounded-[16px] border-[1.5px] border-ink bg-paper p-[clamp(20px,3vw,36px)]"
      style={{
        boxShadow: "var(--offset-md)",
        backgroundImage: "linear-gradient(var(--paper-2) 1px, transparent 1px)",
        backgroundSize: "100% 32px",
      }}
    >
      <div className="relative mb-6 flex items-start justify-between gap-4 border-b-[1.5px] border-dashed border-ink pb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] tracking-[0.24em] text-ink uppercase">
            {t.letter.to}
          </span>
          <span className="font-mono text-[11px] tracking-[0.24em] text-ink-2 uppercase">
            {t.letter.from(guestName)}
          </span>
        </div>
        <div className="relative shrink-0">
          <Stamp className="scale-85 origin-top-right" />
          {postmarked && (
            <Postmark
              color="tomato"
              lines={["HCMUT", "· 2026 ·", "TP.HCM"]}
              rotate={-14}
              className="absolute -top-3 -left-12 pointer-events-none animate-[postmark-stamp_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)_both]"
            />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
