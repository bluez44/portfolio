"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type RefObject } from "react";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { buildBeats } from "./choreography/beats";
import { measureEnvelopeWidth, measureSections } from "./choreography/measure-sections";
import { besideX, envelopeSideX } from "./choreography/placement";
import { createGradCharacter, type GradCharacter } from "./scene/grad-character";

export function useGradCharacter(hostRef: RefObject<HTMLDivElement | null>, { scale = 0.85 } = {}) {
  const reduced = useReducedMotion();
  const { dark } = useIsDark();
  const charRef = useRef<GradCharacter | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (reduced || !host) return;
    gsap.registerPlugin(ScrollTrigger);
    let character: GradCharacter;
    try {
      character = createGradCharacter(host, { scale });
    } catch (error) {
      console.error("Graduation character disabled (WebGL unavailable):", error);
      return;
    }
    charRef.current = character;

    const relayout = () => {
      character.resize(null);
      const metrics = measureSections();
      const { halfW, scale: s } = character.view();
      const sx = envelopeSideX({ viewportW: window.innerWidth, envelopeW: measureEnvelopeWidth(), halfW, scale: s });
      const noteW = metrics?.noteFinale?.width;
      const cheerX = noteW ? besideX({ viewportW: window.innerWidth, objectW: noteW, halfW, scale: s }) : undefined;
      character.resize(metrics && buildBeats(metrics, sx, cheerX));
    };
    const tick = (time: number) => character.frame(time, window.scrollY);

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

  useEffect(() => {
    const id = requestAnimationFrame(() => charRef.current?.applyPalette(dark));
    return () => cancelAnimationFrame(id);
  }, [dark, reduced]);
}
