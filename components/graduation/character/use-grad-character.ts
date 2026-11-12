"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { openedCardScale } from "../envelope/opened-card";
import { buildBeats } from "./choreography/beats";
import { lineAt } from "./choreography/narration";
import { measureEnvelopeWidth, measureSections } from "./choreography/measure-sections";
import { besideX, envelopeSideX } from "./choreography/placement";
import { usePaletteSync } from "../shared/three/use-palette-sync";
import { createGradCharacter, type GradCharacter } from "./scene/grad-character";
import type { Beat, NarrationKey } from "./types";

export type CharacterFrameHandler = (head: { x: number; y: number }, line: NarrationKey | null) => void;

export function useGradCharacter(
  hostRef: RefObject<HTMLDivElement | null>,
  {
    scale = 0.85,
    onReady,
    onFrame,
  }: { scale?: number; onReady?: () => void; onFrame?: CharacterFrameHandler } = {},
) {
  const reduced = useReducedMotion();
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
    let character: GradCharacter;
    try {
      character = createGradCharacter(host, { scale });
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
      const metrics = measureSections();
      const { halfW, scale: s } = character.view();
      const sx = envelopeSideX({ viewportW: window.innerWidth, envelopeW: measureEnvelopeWidth(), cardScale: openedCardScale(), halfW, scale: s });
      const noteW = metrics?.noteFinale?.width;
      const cheerX = noteW ? besideX({ viewportW: window.innerWidth, objectW: noteW, halfW, scale: s }) : undefined;
      beats = metrics ? buildBeats(metrics, sx, cheerX) : null;
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
  }, [hostRef, reduced, scale]);

  usePaletteSync(charRef);
}
