"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useCopy } from "../i18n/lang-context";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { useCompactLayout } from "../shared/use-compact-layout";
import { useMomentCarousel } from "./carousel/use-moment-carousel";
import { BkBadge } from "./components/bk-badge";
import { MomentCarouselNav } from "./components/moment-carousel-nav";
import { MomentList } from "./components/moment-list";
import { NoteFinaleStage } from "./components/note-finale-stage";
import { TrailLine } from "./components/trail-line";
import { finaleProfile } from "./finale/profile";
import { useMomentTrail } from "./trail/use-moment-trail";

export function MetSection({ guestName, togetherPhoto }: { guestName: string; togetherPhoto?: string }) {
  const trailRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const headRef = useScrollReveal<HTMLDivElement>();
  const reduced = useReducedMotion();
  const compact = useCompactLayout();
  useMomentTrail(trailRef, reduced, compact);
  const carousel = useMomentCarousel(listRef, compact);
  const { met: t } = useCopy();

  return (
    <GraduationSection id="met" tone="paper-2" align="left">
      <div ref={trailRef} className="relative flex flex-col gap-10">
        <TrailLine />
        <BkBadge />

        <div ref={headRef} className="relative flex flex-col gap-5">
          <SectionHeading lead={t.heading.lead} accent={t.heading.accent} />
          <p className="m-0 max-w-[52ch] text-[17px] leading-[1.72] text-pretty text-ink-2">{t.intro}</p>
        </div>

        <MomentList ref={listRef} moments={t.moments} label={t.carousel.label} focusable={compact} />
        <MomentCarouselNav {...carousel} copy={t.carousel} />

        <NoteFinaleStage
          guestName={guestName}
          label={t.andYou(guestName)}
          note={t.defaultNote}
          memories={reduced ? [] : t.moments}
          together={togetherPhoto}
          profile={finaleProfile(compact)}
        />
      </div>
    </GraduationSection>
  );
}
