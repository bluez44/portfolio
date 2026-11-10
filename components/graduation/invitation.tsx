"use client";

import { useRef } from "react";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import type { Lang } from "@/lib/graduation/i18n";
import type { InvitationGuest, RsvpStatus } from "@/lib/graduation/types";
import { useTransientFlag } from "@/lib/hooks/use-transient-flag";
import { useGradCharacter } from "./character/use-grad-character";
import { InvitationFooter } from "./chrome/invitation-footer";
import { InvitationHeader } from "./chrome/invitation-header";
import { SideRails } from "./chrome/side-rails";
import { EndsSection } from "./ends/ends-section";
import { EnvelopeStage } from "./envelope/envelope-stage";
import { LangProvider } from "./i18n/lang-context";
import { MetSection } from "./met/met-section";
import { MusicMiniPlayer } from "./music/music-mini-player";
import { useYouTubePlayer } from "./music/use-youtube-player";
import { RsvpSection } from "./rsvp/rsvp-section";

export function GraduationInvitation({
  guest,
  initialRsvp,
  initialLang,
}: {
  guest: InvitationGuest;
  initialRsvp: RsvpStatus | null;
  initialLang: Lang;
}) {
  const canvasHost = useRef<HTMLDivElement>(null);
  useGradCharacter(canvasHost);
  const [musicNote, flashMusicNote] = useTransientFlag(2600);
  const music = useYouTubePlayer(GRADUATION_EVENT.musicYoutubeId, flashMusicNote);

  return (
    <LangProvider initialLang={initialLang}>
      <div id="top" className="relative bg-paper font-sans text-ink">
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[15]" style={{ backgroundImage: "radial-gradient(var(--halftone) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div ref={canvasHost} aria-hidden className="pointer-events-none fixed inset-0 z-[25]" />

        <InvitationHeader musicPlaying={music.status === "playing"} musicNote={musicNote} onMusic={music.toggle} />
        <SideRails />

        <main>
          <EnvelopeStage guestName={guest.name} />
          <MetSection guestName={guest.name} note={guest.note} />
          <EndsSection />
          <RsvpSection slug={guest.slug} guestName={guest.name} initialRsvp={initialRsvp} />
        </main>

        <InvitationFooter />
        <MusicMiniPlayer open={music.open} mountRef={music.mountRef} onClose={music.close} />
      </div>
    </LangProvider>
  );
}
