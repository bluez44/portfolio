"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { TicketCard } from "./ticket-card";
import { useCopy } from "../i18n/lang-context";

export function EndsSection() {
  const headRef = useScrollReveal<HTMLDivElement>();
  const cardRef = useScrollReveal<HTMLDivElement>();
  const { ends: t } = useCopy();
  return (
    <GraduationSection id="ends" tone="paper" align="right">
      <div ref={headRef} className="flex flex-col gap-5">
        <SectionKicker>{t.kicker}</SectionKicker>
        <SectionHeading lead={t.heading.lead} accent={t.heading.accent} />
        <p className="m-0 max-w-[52ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          {t.intro}
        </p>
      </div>
      <div ref={cardRef}>
        <TicketCard />
      </div>
    </GraduationSection>
  );
}
