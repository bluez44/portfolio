"use client";

import type { RsvpAnswer } from "@/lib/graduation/types";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useCopy } from "../i18n/lang-context";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { RsvpForm } from "./rsvp-form";
import { RsvpResult } from "./rsvp-result";
import { useRsvp } from "./use-rsvp";

export function RsvpSection({
  slug,
  guestName,
  initialRsvp,
  ownerPhone,
}: {
  slug: string;
  guestName: string;
  initialRsvp: RsvpAnswer | null;
  ownerPhone: string | null;
}) {
  const ref = useScrollReveal<HTMLDivElement>();
  const rsvp = useRsvp(slug, initialRsvp);
  const { rsvp: t } = useCopy();
  return (
    <GraduationSection id="rsvp" tone="paper-2" align="left" className="min-h-[78vh]">
      <div ref={ref} className="flex flex-col gap-7">
        <SectionHeading lead={t.heading.lead} accent={t.heading.accent} />
        <p className="m-0 max-w-[46ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          {t.prompt(guestName)}
        </p>
        {rsvp.saved && !rsvp.editing ? (
          <RsvpResult status={rsvp.saved.status} onReset={rsvp.edit} />
        ) : (
          <RsvpForm rsvp={rsvp} ownerPhone={ownerPhone} />
        )}
      </div>
    </GraduationSection>
  );
}
