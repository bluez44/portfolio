"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type RefObject } from "react";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { usePerfTier } from "@/lib/hooks/use-perf-tier";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { openedCardScale } from "../envelope/opened-card";
import { buildBeats, type BeatSlots } from "./choreography/beats";
import { lineAt } from "./choreography/narration";
import { measureEnvelopeWidth, measureSections } from "./choreography/measure-sections";
import { besideX, envelopeSideX } from "./choreography/placement";
import { characterProfile, type CharacterProfile } from "./choreography/profile";
import { finaleProfile } from "../met/finale/profile";
import { usePaletteSync } from "../shared/three/use-palette-sync";
import { COMPACT_QUERY } from "../shared/breakpoints";
import { createGradCharacter, type GradCharacter } from "./scene/grad-character";
import type { Beat, NarrationKey } from "./types";

export type CharacterFrameHandler = (head: { x: number; y: number }, line: NarrationKey | null) => void;

/** Slots beside the opened envelope (`sx`) and the grown note (`cheerX`), or the profile's fixed slots on phones. */
function sideSlots(profile: CharacterProfile, view: { halfW: number; scale: number }, noteW: number | undefined): BeatSlots {
  if (profile.slots) return { sx: profile.slots.side, cheerX: profile.slots.cheer, farewellX: profile.slots.farewell };
  const viewportW = window.innerWidth;
  const sx = envelopeSideX({ viewportW, envelopeW: measureEnvelopeWidth(), cardScale: openedCardScale(), ...view });
  return { sx, cheerX: noteW ? besideX({ viewportW, objectW: noteW, ...view }) : undefined };
}

export function useGradCharacter(
  hostRef: RefObject<HTMLDivElement | null>,
  { onReady, onFrame }: { onReady?: () => void; onFrame?: CharacterFrameHandler } = {},
) {
  const reduced = useReducedMotion();
  const compact = useMediaQuery(COMPACT_QUERY);
  const tier = usePerfTier();
  // Until hydration `compact`, `reduced` and `tier` hold the server defaults; waiting creates the
  // WebGL character once instead of creating and disposing one for the wrong device.
  const hydrated = useHydrated();
  const charRef = useRef<GradCharacter | null>(null);
  const onReadyRef = useRef(onReady);
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onReadyRef.current = onReady;
    onFrameRef.current = onFrame;
  }, [onReady, onFrame]);

  useEffect(() => {
    const host = hostRef.current;
    if (!hydrated) return;
    if (reduced || !host) {
      onReadyRef.current?.();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const profile = characterProfile(compact);
    let character: GradCharacter;
    try {
      character = createGradCharacter(host, { scale: profile.scale, tier });
    } catch (error) {
      console.error("Graduation character disabled (WebGL unavailable):", error);
      onReadyRef.current?.();
      return;
    }
    charRef.current = character;
    onReadyRef.current?.();

    let beats: Beat[] | null = null;

    const relayout = () => {
      character.resize(null);
      const metrics = measureSections(finaleProfile(compact));
      beats = metrics ? buildBeats(metrics, sideSlots(profile, character.view(), metrics.noteFinale?.width), profile.stations) : null;
      character.resize(beats);
    };

    const tick = (time: number) => {
      const scrollY = window.scrollY;
      character.frame(time, scrollY);
      if (onFrameRef.current) {
        const head = character.headScreen();
        const line = beats ? lineAt(beats, scrollY) : null;
        onFrameRef.current(head, line);
      }
    };

    relayout();
    ScrollTrigger.addEventListener("refresh", relayout);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", relayout);
      character.dispose();
      charRef.current = null;
    };
  }, [hostRef, reduced, compact, tier, hydrated]);

  usePaletteSync(charRef);
}
