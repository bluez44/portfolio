"use client";

import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { MomentCard } from "./moment-card";
import { PersonalNoteCard } from "./personal-note-card";

export function MetSection({ guestName, note }: { guestName: string; note: string | null }) {
  const headRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>(true);
  const noteRef = useScrollReveal<HTMLDivElement>();
  const { moments, defaultNote, personalNoteEn } = GRADUATION_EVENT;

  return (
    <GraduationSection id="met" tone="paper-2" align="left">
      <div ref={headRef} className="flex flex-col gap-5">
        <SectionKicker>03 · Chúng ta gặp nhau · How we met</SectionKicker>
        <SectionHeading lead="Bốn năm," accent="một hành trình." />
        <p className="m-0 max-w-[52ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          Index cards from the road — những mảnh ghim lại trên bảng, từ ngày đầu nhập học đến hôm nay.
        </p>
      </div>
      <div ref={gridRef} className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-7 gap-y-8">
        {moments.map((m) => <MomentCard key={m.n} moment={m} />)}
      </div>
      <div ref={noteRef}>
        <PersonalNoteCard guestName={guestName} vi={note ?? defaultNote.vi} en={note ? personalNoteEn : defaultNote.en} />
      </div>
    </GraduationSection>
  );
}
