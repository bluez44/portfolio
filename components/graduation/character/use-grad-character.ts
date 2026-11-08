"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type RefObject } from "react";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { buildBeats, envelopeSideX } from "./beats";
import { createGradCharacter, type GradCharacter } from "./grad-character";
import { measureEnvelopeWidth, measureSections } from "./measure-sections";

export function useGradCharacter(hostRef: RefObject<HTMLDivElement | null>, { scale = 0.85 } = {}) {
  const reduced = useReducedMotion();
  const { dark } = useIsDark();
  const charRef = useRef<GradCharacter | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (reduced || !host) return;
    gsap.registerPlugin(ScrollTrigger);
    const character = createGradCharacter(host, { scale });
    charRef.current = character;

    const relayout = () => {
      character.resize(null);
      const metrics = measureSections();
      const { halfW, scale: s } = character.view();
      const sx = envelopeSideX({ viewportW: window.innerWidth, envelopeW: measureEnvelopeWidth(), halfW, scale: s });
      character.resize(metrics && buildBeats(metrics, sx));
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
