"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { TicketCard } from "./ticket-card";
import { useVenueGuide } from "./venue-guide/use-venue-guide";
import { VenueGuide } from "./venue-guide/venue-guide";
import { useCopy } from "../i18n/lang-context";

export function EndsSection({ onTourOpen, onTourClose }: { onTourOpen?: () => void; onTourClose?: () => void }) {
  const headRef = useScrollReveal<HTMLDivElement>();
  const cardRef = useScrollReveal<HTMLDivElement>();
  const guideRef = useScrollReveal<HTMLDivElement>();
  const { ref: mapRef, tab, setTab, showMap } = useVenueGuide();
  const { ends: t } = useCopy();
  // Increments each time the tour is opened so LazyEmbed remounts fresh (unmounts the iframe on close).
  const tourMountKey = useRef(0);

  const handleTabChange = (next: Parameters<typeof setTab>[0]) => {
    if (next === "tour") {
      tourMountKey.current += 1;
      onTourOpen?.();
    } else if (tab === "tour") {
      onTourClose?.();
    }
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
        <TicketCard onDirections={showMap} />
      </div>
      <div ref={guideRef}>
        <VenueGuide ref={mapRef} tab={tab} onTabChange={handleTabChange} tourKey={tourMountKey.current} />
      </div>
    </GraduationSection>
  );
}
