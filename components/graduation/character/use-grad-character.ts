"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type RefObject } from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { usePerfTier } from "@/lib/hooks/use-perf-tier";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { openedCardScale } from "../envelope/opened-card";
import { buildBeats } from "./choreography/beats";
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
function sideSlots(profile: CharacterProfile, view: { halfW: number; scale: number }, noteW: number | undefined): { sx: number; cheerX?: number } {
  if (profile.slots) return { sx: profile.slots.side, cheerX: profile.slots.cheer };
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
  const charRef = useRef<GradCharacter | null>(null);
  const onReadyRef = useRef(onReady);
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onReadyRef.current = onReady;
    onFrameRef.current = onFrame;
  }, [onReady, onFrame]);

  useEffect(() => {
    const host = hostRef.current;
    if (reduced || !host) {
      onReadyRef.current?.();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    // Read the query directly: the hook's first render uses the server snapshot (wide) on phones too.
    const phone = window.matchMedia(COMPACT_QUERY).matches;
    const profile = characterProfile(phone);
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
      const metrics = measureSections(finaleProfile(phone));
      const { sx, cheerX } = sideSlots(profile, character.view(), metrics?.noteFinale?.width);
      beats = metrics ? buildBeats(metrics, sx, cheerX, profile.stations) : null;
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
  }, [hostRef, reduced, compact, tier]);

  usePaletteSync(charRef);
}
