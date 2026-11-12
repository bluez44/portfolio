"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { BeeIntroScene } from "../intro/bee-intro-scene";

const TOP = '[data-intro-bar="top"]';
const BOTTOM = '[data-intro-bar="bottom"]';
const BARS = "[data-intro-bar]";
const CHARS = "[data-intro-char]";
const FADERS = "[data-intro-fade]";
const TOAST = "[data-intro-toast]";
const BACKDROP = "[data-intro-backdrop]";

/** The design's letterbox entrance and exit, scoped to the intro root. */
export function useIntroTimeline(rootRef: RefObject<HTMLElement | null>, reduced: boolean) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {}, root);
    ctxRef.current = ctx;
    let cancelled = false;
    if (!reduced) {
      (document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (cancelled) return;
        ctx.add(() => {
          gsap
            .timeline()
            .fromTo(TOP, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 1.1, ease: "power4.inOut", clearProps: "transform" }, 0)
            .fromTo(BOTTOM, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 1.1, ease: "power4.inOut", clearProps: "transform" }, 0)
            .from(CHARS, { yPercent: 115, duration: 1.15, stagger: 0.035, ease: "power4.out" }, 0.35)
            .from(FADERS, { opacity: 0, y: 14, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.85);
        });
      });
    }
    return () => {
      cancelled = true;
      ctx.revert();
      ctxRef.current = null;
    };
  }, [rootRef, reduced]);

  /** Plays the exit; `scene` (when given) wakes the bee first. `onReveal` fires as the bars start to part. */
  const exit = useCallback(
    (scene: BeeIntroScene | null, onDone: () => void, onReveal?: () => void) => {
      const ctx = ctxRef.current;
      const root = rootRef.current;
      if (!ctx || !root) return onDone();
      ctx.add(() => {
        if (reduced) {
          gsap.to(root, { opacity: 0, duration: 0.45, onComplete: onDone });
          return;
        }
        const tl = gsap.timeline({ onComplete: onDone });
        tl.to(CHARS, { yPercent: -115, duration: 0.7, stagger: 0.022, ease: "power3.in" }, 0).to(
          FADERS,
          { opacity: 0, y: -12, duration: 0.45, stagger: 0.04, ease: "power2.in" },
          0,
        );
        let end = 0.55;
        if (scene) {
          const wake = gsap.timeline();
          end = scene.wake(wake);
          tl.add(wake, 0)
            .to(TOAST, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.6)
            .to(TOAST, { opacity: 0, duration: 0.4 }, Math.max(1.2, end - 0.8));
        }
        tl.to(`${BARS} > *`, { opacity: 0, duration: 0.3 }, end - 0.45)
          .set(TOP, { transformOrigin: "50% 0%" }, end - 0.35)
          .set(BOTTOM, { transformOrigin: "50% 100%" }, end - 0.35)
          .to(BARS, { scaleY: (_i: number, el: HTMLElement) => (innerHeight * 0.505) / el.offsetHeight, duration: 0.6, ease: "power4.inOut" }, end - 0.35)
          .set(BACKDROP, { autoAlpha: 0 })
          .set(root, { backgroundColor: "transparent", pointerEvents: "none" })
          .add(() => {
            scene?.pause();
            onReveal?.();
          })
          .to(BARS, { scaleY: 0, duration: 0.95, ease: "power4.inOut" }, "+=0.12");
      });
    },
    [rootRef, reduced],
  );

  return { exit };
}
