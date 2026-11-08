import type { Metadata } from "next";
import {
  GraduationSection,
  GraduationShell,
  Slot,
} from "@/components/graduation/graduation-shell";

export const metadata: Metadata = {
  title: "Graduation Invitation – Võ Lê Quang Vinh",
  description: "You're invited to celebrate my graduation.",
  alternates: { canonical: "/graduation" },
  // Personal invitation: keep it out of search results. Remove to make it indexable.
  robots: { index: false, follow: false },
};

export default function GraduationPage() {
  return (
    <GraduationShell>
      {/* 01 — cover / invitation card */}
      <GraduationSection kicker="01 · You're invited" title={<>Graduation <span className="italic text-tomato" style={{ fontVariationSettings: '"wdth" 82' }}>day.</span></>}>
        <Slot label="Invitation card goes here" className="min-h-[clamp(320px,50vh,520px)]" />
      </GraduationSection>

      {/* 02 — date, time, venue */}
      <GraduationSection id="details" kicker="02 · Details" tone="paper-2">
        <div className="grid gap-6 md:grid-cols-3">
          <Slot label="Date & time" />
          <Slot label="Venue & map" />
          <Slot label="Dress code / notes" />
        </div>
      </GraduationSection>

      {/* 03 — RSVP / guest message */}
      <GraduationSection id="rsvp" kicker="03 · RSVP">
        <Slot label="RSVP form / guest wishes" />
      </GraduationSection>
    </GraduationShell>
  );
}
