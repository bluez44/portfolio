"use client";

import { useEffect, useRef, useState } from "react";
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
  const [tourMountKey, setTourMountKey] = useState(0);
  // Music only ducks when the visitor actually starts the 3D tour, and comes
  // back when they leave it — by switching tab or scrolling away.
  const tourMutedMusic = useRef(false);
  const onTourCloseRef = useRef(onTourClose);
  useEffect(() => {
    onTourCloseRef.current = onTourClose;
  }, [onTourClose]);

  const resumeMusic = () => {
    if (!tourMutedMusic.current) return;
    tourMutedMusic.current = false;
    onTourCloseRef.current?.();
  };

  const handleTourStart = () => {
    tourMutedMusic.current = true;
    onTourOpen?.();
  };

  const handleTabChange = (next: Parameters<typeof setTab>[0]) => {
    if (next === "tour") {
      setTourMountKey((k) => k + 1);
    } else if (tab === "tour") {
      resumeMusic();
    }
    setTab(next);
  };

  // Scrolling the section out of view also brings the music back.
  useEffect(() => {
    const el = document.getElementById("ends");
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting && tourMutedMusic.current) {
        tourMutedMusic.current = false;
        onTourCloseRef.current?.();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        <VenueGuide
          ref={mapRef}
          tab={tab}
          onTabChange={handleTabChange}
          tourKey={tourMountKey}
          onTourStart={handleTourStart}
        />
      </div>
    </GraduationSection>
  );
}
