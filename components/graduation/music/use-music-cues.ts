"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MusicStatus } from "./use-youtube-player";
import { volumeFor, type CueId } from "./music-cues";

export type FadeableAudio = {
  status: MusicStatus;
  fadeTo: (volume: number, ms?: number) => void;
};

const CHAPTER_SELECTORS = ["#met", "#ends", "#rsvp", "#bee-wall"] as const;
const DIP_DURATION_MS = 1200;
const FADE_STEP_MS = 600;

export function useMusicCues(audio: FadeableAudio) {
  const audioRef = useRef(audio);
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const active = new Set<CueId>();
    let dipTimer: number | undefined;

    const syncVolume = () => {
      if (audioRef.current.status !== "playing") return;
      audioRef.current.fadeTo(volumeFor(active), FADE_STEP_MS);
    };

    const triggerDip = () => {
      active.add("chapter-dip");
      syncVolume();
      window.clearTimeout(dipTimer);
      dipTimer = window.setTimeout(() => {
        active.delete("chapter-dip");
        syncVolume();
      }, DIP_DURATION_MS);
    };

    const ctx = gsap.context(() => {
      for (const sel of CHAPTER_SELECTORS) {
        const el = document.querySelector(sel);
        if (!el) continue;
        ScrollTrigger.create({
          trigger: el,
          start: "top 75%",
          onEnter: triggerDip,
          onEnterBack: triggerDip,
        });
      }

      const finale = document.querySelector("#finale");
      if (finale) {
        ScrollTrigger.create({
          trigger: finale,
          start: "top 75%",
          onEnter: () => {
            active.add("finale-swell");
            syncVolume();
          },
          onLeaveBack: () => {
            active.delete("finale-swell");
            syncVolume();
          },
        });
      }
    });

    const rsvpForm = document.querySelector("#rsvp form");
    const onFocusIn = () => {
      active.add("writing");
      syncVolume();
    };
    const onFocusOut = (e: FocusEvent) => {
      const nextTarget = e.relatedTarget as Node | null;
      if (rsvpForm && nextTarget && rsvpForm.contains(nextTarget)) return;
      active.delete("writing");
      syncVolume();
    };

    rsvpForm?.addEventListener("focusin", onFocusIn);
    rsvpForm?.addEventListener("focusout", onFocusOut as EventListener);

    return () => {
      window.clearTimeout(dipTimer);
      rsvpForm?.removeEventListener("focusin", onFocusIn);
      rsvpForm?.removeEventListener("focusout", onFocusOut as EventListener);
      ctx.revert();
    };
  }, []);
}
