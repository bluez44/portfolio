"use client";

import { useRef } from "react";
import type { RsvpAnswer } from "@/lib/graduation/types";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useCopy } from "../i18n/lang-context";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { ReplyPostcard } from "./reply-postcard";
import { RsvpForm } from "./rsvp-form";
import { RsvpResult } from "./rsvp-result";
import { useReplySendoff } from "./use-reply-sendoff";
import { useRsvp } from "./use-rsvp";

export function RsvpSection({
  guestId,
  guestName,
  initialRsvp,
  ownerPhone,
  soundOn,
  onSaved,
}: {
  guestId: string;
  guestName: string;
  initialRsvp: RsvpAnswer | null;
  ownerPhone: string | null;
  soundOn: boolean;
  onSaved?: (answer: RsvpAnswer) => void;
}) {
  const ref = useScrollReveal<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement>(null);
  const { showResult, postmarked, startSendoff } = useReplySendoff(cardRef, Boolean(initialRsvp), soundOn);
  const rsvp = useRsvp(guestId, initialRsvp, {
    onSaved: (ans) => {
      onSaved?.(ans);
      void startSendoff(ans.status);
    },
  });
  const { rsvp: t } = useCopy();

  return (
    <GraduationSection id="rsvp" tone="paper-2" align="left" className="min-h-[78vh]">
      <div ref={ref} className="flex flex-col gap-7">
        <SectionHeading lead={t.heading.lead} accent={t.heading.accent} />
        <p className="m-0 max-w-[46ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          {t.prompt(guestName)}
        </p>
        <div className="perspective-distant">
          <div ref={cardRef} className="transform-3d">
            <ReplyPostcard guestName={guestName} postmarked={postmarked} status={rsvp.saved?.status}>
              {rsvp.saved && !rsvp.editing && showResult ? (
                <RsvpResult status={rsvp.saved.status} onReset={rsvp.edit} />
              ) : (
                <RsvpForm rsvp={rsvp} ownerPhone={ownerPhone} />
              )}
            </ReplyPostcard>
          </div>
        </div>
      </div>
    </GraduationSection>
  );
}
