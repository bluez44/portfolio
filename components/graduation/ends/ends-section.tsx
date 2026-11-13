"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { TicketCard } from "./ticket-card";
import { useVenueGuide } from "./venue-guide/use-venue-guide";
import { VenueGuide } from "./venue-guide/venue-guide";
import { useCopy } from "../i18n/lang-context";

export function EndsSection({
  tourKey,
  onTourStart,
  onTourLeave,
}: {
  tourKey: number;
  onTourStart: () => void;
  onTourLeave: () => void;
}) {
  const headRef = useScrollReveal<HTMLDivElement>();
  const cardRef = useScrollReveal<HTMLDivElement>();
  const guideRef = useScrollReveal<HTMLDivElement>();
  const { ref: mapRef, tab, setTab, showMap } = useVenueGuide();
  const { ends: t } = useCopy();

  const handleTabChange = (next: Parameters<typeof setTab>[0]) => {
    if (next !== "tour") onTourLeave();
    setTab(next);
  };

  return (
    <GraduationSection id="ends" tone="paper" align="right">
      <div ref={headRef} className="flex flex-col gap-5">
        <SectionHeading lead={t.heading.lead} accent={t.heading.accent} />
        <p className="m-0 max-w-[52ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          {t.intro}
        </p>
      </div>
      <div ref={cardRef}>
        <TicketCard
          onDirections={() => {
            onTourLeave();
            showMap();
          }}
        />
      </div>
      <div ref={guideRef}>
        <VenueGuide
          ref={mapRef}
          tab={tab}
          onTabChange={handleTabChange}
          tourKey={tourKey}
          onTourStart={onTourStart}
        />
      </div>
    </GraduationSection>
  );
}
