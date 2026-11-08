"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.to(el, { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, reduced]);
}
