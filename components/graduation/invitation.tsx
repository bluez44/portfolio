"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import type { Lang } from "@/lib/graduation/i18n";
import type { InvitationGuest, RsvpAnswer } from "@/lib/graduation/types";
import { useTransientFlag } from "@/lib/hooks/use-transient-flag";
import { useGradCharacter } from "./character/use-grad-character";
import { NarratorBubble, type NarratorBubbleHandle } from "./character/narrator-bubble";
import { useCharacterAvoid } from "./character/use-character-avoid";
import { CourierBeeProvider } from "./courier/courier-bee-provider";
import { InvitationHeader } from "./chrome/invitation-header";
import { SideRails } from "./chrome/side-rails";
import { EndsSection } from "./ends/ends-section";
import { EnvelopeStage } from "./envelope/envelope-stage";
import { LetterGate } from "./gate/letter-gate";
import { LangProvider } from "./i18n/lang-context";
import {
  GRADUATION_GATE_RESOURCES as GATE,
  ResourceGateProvider,
  useResourceGate,
} from "./loading/resource-gate";
import { MetSection } from "./met/met-section";
import { useYouTubePlayer } from "./music/use-youtube-player";
import { useMusicCues } from "./music/use-music-cues";
import { RsvpSection } from "./rsvp/rsvp-section";
import { HalftoneSeam } from "./shared/halftone-seam";
import { WishesSection } from "./wishes/wishes-section";
import { FinaleSection } from "./finale/finale-section";

type InvitationProps = {
  guest: InvitationGuest;
  initialRsvp: RsvpAnswer | null;
  initialLang: Lang;
  ownerPhone: string | null;
};

const NO_OVERLAY = () => null;

export function GraduationInvitation(props: InvitationProps) {
  return (
    <LangProvider initialLang={props.initialLang} customContent={props.guest.customContent}>
      <ResourceGateProvider resources={Object.values(GATE)} overlay={NO_OVERLAY}>
        <CourierBeeProvider>
          <InvitationContent {...props} />
        </CourierBeeProvider>
      </ResourceGateProvider>
    </LangProvider>
  );
}

function InvitationContent({ guest, initialRsvp, ownerPhone }: InvitationProps) {
  const gate = useResourceGate();
  const canvasHost = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<NarratorBubbleHandle>(null);
  const characterLayer = useRef<HTMLDivElement>(null);
  useGradCharacter(canvasHost, {
    onReady: () => gate?.resolve(GATE.character),
    onFrame: (head, line) => bubbleRef.current?.update(head, line),
  });
  useCharacterAvoid(characterLayer);
  const [musicNote, flashMusicNote] = useTransientFlag(2600);
  const musicId = guest.customContent?.music?.youtubeId || GRADUATION_EVENT.musicYoutubeId;
  const music = useYouTubePlayer(musicId, flashMusicNote, () => gate?.resolve(GATE.music));
  const { status: musicStatus, mountRef: musicMountRef, start: startMusic, toggle: toggleMusic, fadePause, fadeResume } = music;
  useMusicCues(music);

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
      <div ref={characterLayer} className="transition-opacity duration-300">
        <div ref={canvasHost} aria-hidden className="pointer-events-none fixed inset-0 z-25" />
        <NarratorBubble ref={bubbleRef} guestName={guest.name} />
      </div>

      <LetterGate ready={!gate?.pending} guestName={guest.name} musicPlaying={musicStatus === "playing"} onOpen={startMusic} onOpened={onLetterOpened} />
      <div inert={!letterOpened}>
        <InvitationHeader musicPlaying={musicStatus === "playing"} musicNote={musicNote} onMusic={toggleMusic} />
        <SideRails />

        <main>
          <EnvelopeStage guestName={guest.name} />
          <HalftoneSeam from="paper" to="paper-2" />
          <MetSection guestName={guest.name} note={guest.customContent?.met?.note ?? guest.note} togetherPhoto={guest.customContent?.met?.togetherPhoto} />
          <HalftoneSeam from="paper-2" to="paper" />
          <EndsSection onTourOpen={fadePause} onTourClose={fadeResume} />
          <HalftoneSeam from="paper" to="paper-2" />
          <RsvpSection
            slug={guest.slug}
            guestName={guest.name}
            initialRsvp={initialRsvp}
            ownerPhone={ownerPhone}
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
