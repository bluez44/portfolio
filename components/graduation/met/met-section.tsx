"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useCopy } from "../i18n/lang-context";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { BkBadge } from "./components/bk-badge";
import { MomentCard } from "./components/moment-card";
import { NoteFinaleStage } from "./components/note-finale-stage";
import { TrailLine } from "./components/trail-line";
import { useMomentTrail } from "./trail/use-moment-trail";

export function MetSection({ guestName, note }: { guestName: string; note: string | null }) {
  const trailRef = useRef<HTMLDivElement>(null);
  const headRef = useScrollReveal<HTMLDivElement>();
  const reduced = useReducedMotion();
  useMomentTrail(trailRef, reduced);
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

        <ol className="m-0 flex list-none flex-col gap-32 p-0">
          {t.moments.map((m, i) => (
            <MomentCard key={m.n} moment={m} side={i % 2 === 0 ? "left" : "right"} />
          ))}
        </ol>

        <NoteFinaleStage guestName={guestName} label={t.andYou(guestName)} note={note ?? t.defaultNote} />
      </div>
    </GraduationSection>
  );
}
