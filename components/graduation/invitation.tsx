"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GraduationSettingsContent, GuestContent } from "@/lib/graduation/content/settings-types";
import type { Lang } from "@/lib/graduation/i18n";
import type { InvitationGuest, RsvpAnswer } from "@/lib/graduation/types";
import { useTransientFlag } from "@/lib/hooks/use-transient-flag";
import { useGradCharacter } from "./character/use-grad-character";
import { NarratorBubble, type NarratorBubbleHandle } from "./character/narrator-bubble";
import { CourierBeeProvider } from "./courier/courier-bee-provider";
import { InvitationHeader } from "./chrome/invitation-header";
import { SideRails } from "./chrome/side-rails";
import { EndsSection } from "./ends/ends-section";
import { EnvelopeStage } from "./envelope/envelope-stage";
import { LetterGate } from "./gate/letter-gate";
import { LangProvider, useLang } from "./i18n/lang-context";
import {
  GRADUATION_GATE_RESOURCES as GATE,
  ResourceGateProvider,
  useResourceGate,
} from "./loading/resource-gate";
import { MetSection } from "./met/met-section";
import { useYouTubePlayer } from "./music/use-youtube-player";
import { useMusicCues } from "./music/use-music-cues";
import { useTourSession } from "./ends/venue-guide/use-tour-session";
import { RsvpSection } from "./rsvp/rsvp-section";
import { HalftoneSeam } from "./shared/halftone-seam";
import { WishesSection } from "./wishes/wishes-section";
import { FinaleSection } from "./finale/finale-section";

type InvitationProps = {
  guest: InvitationGuest;
  guestContent: GuestContent;
  settings: GraduationSettingsContent;
  initialRsvp: RsvpAnswer | null;
  initialLang: Lang;
  envPhone: string | null;
};

const NO_OVERLAY = () => null;

export function GraduationInvitation(props: InvitationProps) {
  return (
    <LangProvider initialLang={props.initialLang} settings={props.settings} guest={props.guestContent} guestId={props.guest.id} envPhone={props.envPhone}>
      <ResourceGateProvider resources={Object.values(GATE)} overlay={NO_OVERLAY}>
        <CourierBeeProvider>
          <InvitationContent {...props} />
        </CourierBeeProvider>
      </ResourceGateProvider>
    </LangProvider>
  );
}

function InvitationContent({ guest, initialRsvp }: InvitationProps) {
  const { owner, images, event } = useLang();
  const gate = useResourceGate();
  const canvasHost = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<NarratorBubbleHandle>(null);
  useGradCharacter(canvasHost, {
    onReady: () => gate?.resolve(GATE.character),
    onFrame: (head, line) => bubbleRef.current?.update(head, line),
  });
  const [musicNote, flashMusicNote] = useTransientFlag(2600);
  const musicId = event.musicYoutubeId;
  const music = useYouTubePlayer(musicId, flashMusicNote, () => gate?.resolve(GATE.music));
  const { status: musicStatus, mountRef: musicMountRef, start: startMusic, toggle: toggleMusic, fadePause, fadeResume } = music;
  const tour = useTourSession();
  useMusicCues({ ...music, status: tour.open ? "paused" : musicStatus });

  const startTour = () => {
    tour.start();
    fadePause();
  };
  const leaveTour = () => {
    if (!tour.open) return;
    tour.close();
    fadeResume();
  };
  const onMusic = () => {
    if (!tour.open) return toggleMusic();
    tour.close();
    startMusic();
  };

  // No track configured means there is no music to wait for.
  useEffect(() => {
    if (!musicId) gate?.resolve(GATE.music);
  }, [musicId, gate]);

  const [letterOpened, setLetterOpened] = useState(false);
  const onLetterOpened = useCallback(() => setLetterOpened(true), []);
  useEffect(() => {
    if (letterOpened) document.getElementById("stage")?.focus({ preventScroll: true });
  }, [letterOpened]);

  const [wishRefreshKey, setWishRefreshKey] = useState(0);
  const [currentRsvp, setCurrentRsvp] = useState<RsvpAnswer | null>(initialRsvp);
  const handleRsvpSaved = useCallback((answer: RsvpAnswer) => {
    setCurrentRsvp(answer);
    setWishRefreshKey((k) => k + 1);
  }, []);

  return (
    <div id="top" className="relative bg-paper font-sans text-ink">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-15" style={{ backgroundImage: "radial-gradient(var(--halftone) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div ref={canvasHost} aria-hidden className="pointer-events-none fixed inset-0 z-25" />
      <NarratorBubble ref={bubbleRef} guestName={guest.name} />

      <LetterGate ready={!gate?.pending} guestName={guest.name} musicPlaying={musicStatus === "playing"} onOpen={startMusic} onOpened={onLetterOpened} />
      <div inert={!letterOpened}>
        <InvitationHeader musicPlaying={musicStatus === "playing"} musicNote={musicNote} onMusic={onMusic} />
        <SideRails />

        <main>
          <EnvelopeStage guestName={guest.name} />
          <HalftoneSeam from="paper" to="paper-2" />
          <MetSection guestName={guest.name} togetherPhoto={images.togetherPhoto} />
          <HalftoneSeam from="paper-2" to="paper" />
          <EndsSection tourKey={tour.key} onTourStart={startTour} onTourLeave={leaveTour} />
          <HalftoneSeam from="paper" to="paper-2" />
          <RsvpSection
            guestId={guest.id}
            guestName={guest.name}
            initialRsvp={initialRsvp}
            ownerPhone={owner.phone}
            soundOn={musicStatus === "playing"}
            onSaved={handleRsvpSaved}
          />
          <HalftoneSeam from="paper-2" to="paper" />
          <WishesSection guestId={guest.id} refreshKey={wishRefreshKey} />
          <HalftoneSeam from="paper" to="paper" />
          <FinaleSection guestName={guest.name} guestId={guest.id} rsvp={currentRsvp} />
        </main>

        {/* <InvitationFooter /> */}
        <div aria-hidden className="sr-only">
          <div ref={musicMountRef} />
        </div>
      </div>
    </div>
  );
}
