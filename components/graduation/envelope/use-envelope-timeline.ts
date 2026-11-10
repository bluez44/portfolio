"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";

export function useEnvelopeTimeline(rootRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("#card", { zIndex: 1 });
      gsap.set("#flap", { zIndex: 3, transformOrigin: "50% 0%", transformPerspective: 900 });
      gsap.set("#envFront", { visibility: "visible" });
      gsap.set("#envBack", { visibility: "hidden" });

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
        .to("#hint", { opacity: 0, y: -12, duration: 0.08 }, 0)
        .to(
          "#envWrap",
          { rotationX: 0, rotationZ: 0, duration: 0.12, ease: "power1.out" },
          0,
        )
        .fromTo(
          "#envFlip",
          { rotationY: 0 },
          {
            rotationY: 180,
            duration: 0.2,
            ease: "power2.inOut",
            immediateRender: false,
          },
          0.1,
        )
        .set("#envFront", { visibility: "hidden" }, 0.2)
        .set("#envBack", { visibility: "visible" }, 0.2)
        .fromTo(
          "#flap",
          { rotationX: 0 },
          {
            rotationX: 180,
            duration: 0.14,
            ease: "power2.inOut",
            immediateRender: false,
          },
          0.32,
        )
        .set("#flap", { zIndex: 0 }, 0.4)
        .fromTo(
          "#card",
          { yPercent: 0 },
          {
            yPercent: -100,
            duration: 0.18,
            ease: "power2.out",
            immediateRender: false,
          },
          0.46,
        )
        .set("#card", { zIndex: 4 }, 0.645)
        // A transformed shell becomes a stacking context and would lift the card above the pocket;
        // clear it whenever the playhead scrubs back before the exit.
        .call(() => gsap.set("#envShell", { clearProps: "transform,opacity" }), [], 0.649)
        .fromTo(
          "#envShell",
          { yPercent: 0, opacity: 1, scale: 1 },
          {
            yPercent: 150,
            opacity: 0,
            scale: 0.8,
            duration: 0.2,
            ease: "power2.in",
            immediateRender: false,
          },
          0.65,
        )
        .fromTo(
          "#card",
          { yPercent: -100, scale: 1 },
          {
            yPercent: 0,
            scale: 1.32,
            duration: 0.2,
            ease: "power2.inOut",
            immediateRender: false,
          },
          0.65,
        )
        .to("#coverKicker", { opacity: 0, y: -10, duration: 0.08 }, 0.3)
        .to("#greetKicker", { opacity: 1, duration: 0.08 }, 0.72)
        .to({}, { duration: 0.14 }, 0.86);
    }, root);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, [rootRef, enabled]);
}
