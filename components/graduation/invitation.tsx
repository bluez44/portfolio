"use client";

import { useEffect, useRef } from "react";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import type { Lang } from "@/lib/graduation/i18n";
import type { InvitationGuest, RsvpAnswer } from "@/lib/graduation/types";
import { useTransientFlag } from "@/lib/hooks/use-transient-flag";
import { useGradCharacter } from "./character/use-grad-character";
import { InvitationFooter } from "./chrome/invitation-footer";
import { InvitationHeader } from "./chrome/invitation-header";
import { SideRails } from "./chrome/side-rails";
import { EndsSection } from "./ends/ends-section";
import { EnvelopeStage } from "./envelope/envelope-stage";
import { LangProvider } from "./i18n/lang-context";
import {
  GRADUATION_GATE_RESOURCES as GATE,
  ResourceGateProvider,
  useResourceGate,
} from "./loading/resource-gate";
import { MetSection } from "./met/met-section";
import { useYouTubePlayer } from "./music/use-youtube-player";
import { RsvpSection } from "./rsvp/rsvp-section";
import { WishesSection } from "./wishes/wishes-section";

type InvitationProps = {
  guest: InvitationGuest;
  initialRsvp: RsvpAnswer | null;
  initialLang: Lang;
  ownerPhone: string | null;
};

export function GraduationInvitation(props: InvitationProps) {
  return (
    <ResourceGateProvider resources={Object.values(GATE)}>
      <InvitationContent {...props} />
    </ResourceGateProvider>
  );
}

function InvitationContent({ guest, initialRsvp, initialLang, ownerPhone }: InvitationProps) {
  const gate = useResourceGate();
  const canvasHost = useRef<HTMLDivElement>(null);
  useGradCharacter(canvasHost, { onReady: () => gate?.resolve(GATE.character) });
  const [musicNote, flashMusicNote] = useTransientFlag(2600);
  const musicId = guest.customContent?.music?.youtubeId || GRADUATION_EVENT.musicYoutubeId;
  const { status: musicStatus, mountRef: musicMountRef, toggle: musicToggle, pause: musicPause, resume: musicResume } =
    useYouTubePlayer(musicId, flashMusicNote, true, () => gate?.resolve(GATE.music));

  // No track configured means there is no music to wait for.
  useEffect(() => {
    if (!musicId) gate?.resolve(GATE.music);
  }, [musicId, gate]);

  return (
    <LangProvider initialLang={initialLang} customContent={guest.customContent}>
      <div id="top" className="relative bg-paper font-sans text-ink">
        <div aria-hidden className="pointer-events-none fixed inset-0 z-15" style={{ backgroundImage: "radial-gradient(var(--halftone) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div ref={canvasHost} aria-hidden className="pointer-events-none fixed inset-0 z-25" />

        <InvitationHeader musicPlaying={musicStatus === "playing"} musicNote={musicNote} onMusic={musicToggle} />
        <SideRails />

        <main>
          <EnvelopeStage guestName={guest.name} />
          <MetSection guestName={guest.name} note={guest.customContent?.met?.note ?? guest.note} />
          <EndsSection onTourOpen={musicPause} onTourClose={musicResume} />
          <RsvpSection slug={guest.slug} guestName={guest.name} initialRsvp={initialRsvp} ownerPhone={ownerPhone} />
          <WishesSection />
        </main>

        <InvitationFooter />
        {/* Hidden iframe mount – keeps YouTube player alive without showing the mini-player UI */}
        <div ref={musicMountRef} aria-hidden className="sr-only" />
      </div>
    </LangProvider>
  );
}
