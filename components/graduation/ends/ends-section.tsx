"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { TicketCard } from "./ticket-card";

export function EndsSection() {
  const headRef = useScrollReveal<HTMLDivElement>();
  const cardRef = useScrollReveal<HTMLDivElement>();
  return (
    <GraduationSection id="ends" tone="paper" align="right">
      <div ref={headRef} className="flex flex-col gap-5">
        <SectionKicker>04 · Hồi kết · How it ends</SectionKicker>
        <SectionHeading lead="Và rồi," accent="tốt nghiệp." />
        <p className="m-0 max-w-[52ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          Chương này khép lại bằng một buổi lễ — and it would mean a lot to share it with you.
        </p>
      </div>
      <div ref={cardRef}>
        <TicketCard />
      </div>
    </GraduationSection>
  );
}
