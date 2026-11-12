"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";

export function useFinaleTimeline(rootRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!enabled) {
        // In reduced motion, show envelope in its settled closed state
        gsap.set("#finaleCard", { yPercent: 0, zIndex: 1 });
        gsap.set("#finaleFlap", { rotationX: 0, zIndex: 4, transformOrigin: "50% 0%" });
        return;
      }

      // Initial state before scrub: flap open, card sticking out
      gsap.set("#finaleFlap", { rotationX: 180, zIndex: 0, transformOrigin: "50% 0%", transformPerspective: 900 });
      gsap.set("#finaleCard", { yPercent: -65, zIndex: 1 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
          defaults: { ease: "none" },
        })
        // 1. Slide card down into the pocket
        .to("#finaleCard", { yPercent: 0, duration: 0.45, ease: "power1.inOut" }, 0.05)
        // 2. Fold flap down over the card and pocket
        .to("#finaleFlap", { rotationX: 0, duration: 0.4, ease: "power2.inOut" }, 0.5)
        .set("#finaleFlap", { zIndex: 4 }, 0.7)
        // 3. Settle envelope
        .to("#finaleWrap", { scale: 0.98, duration: 0.1, ease: "power1.out" }, 0.9);
    }, root);

    return () => ctx.revert();
  }, [enabled, rootRef]);
}
