"use client";

import type { RsvpStatus } from "@/lib/graduation/types";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { RsvpChoices } from "./rsvp-choices";
import { RsvpResult } from "./rsvp-result";
import { useRsvp } from "./use-rsvp";
import { useCopy } from "../i18n/lang-context";

export function RsvpSection({
  slug,
  guestName,
  initialRsvp,
}: {
  slug: string;
  guestName: string;
  initialRsvp: RsvpStatus | null;
}) {
  const ref = useScrollReveal<HTMLDivElement>();
  const { status, pending, error, choose, reset } = useRsvp(slug, initialRsvp);
  const { rsvp: t } = useCopy();
  return (
    <GraduationSection id="rsvp" tone="paper-2" align="left" className="min-h-[78vh]">
      <div ref={ref} className="flex flex-col gap-7">
        <SectionKicker>05 · RSVP</SectionKicker>
        <SectionHeading lead={t.heading.lead} accent={t.heading.accent} />
        <p className="m-0 max-w-[46ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          {t.prompt(guestName)}
        </p>
        {status ? <RsvpResult status={status} onReset={reset} /> : <RsvpChoices pending={pending} error={error} onChoose={choose} />}
      </div>
    </GraduationSection>
  );
}
