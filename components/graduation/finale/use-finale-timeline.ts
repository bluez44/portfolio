"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";
import { openFlapFit, type FlapFit } from "./flap-clearance";

const bottomOf = (el: HTMLElement) => el.offsetTop + el.offsetHeight;

/** The open-flap fit for the current layout; offsets ignore the transforms the timeline sets. */
function measureFit(root: HTMLElement): FlapFit {
  const get = (id: string) => root.querySelector<HTMLElement>(`#${id}`);
  const [header, wrap, flap, footer] = [get("finaleHeader"), get("finaleWrap"), get("finaleFlap"), get("finaleFooter")];
  const seal = flap?.querySelector<HTMLElement>("[data-wax-seal]");
  if (!header || !wrap || !flap || !footer) return { y: 0, scale: 1 };
  return openFlapFit({
    headerBottom: bottomOf(header),
    wrapTop: wrap.offsetTop,
    wrapBottom: bottomOf(wrap),
    footerTop: footer.offsetTop,
    flapHeight: flap.offsetHeight,
    sealHeight: seal?.offsetHeight ?? 0,
  });
}

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
        gsap.set("#finaleHeader", { y: 72 });
        return;
      }

      // Initial state before scrub: flap open, card sticking out
      gsap.set("#finaleFlap", { rotationX: 180, zIndex: 0, transformOrigin: "50% 0%", transformPerspective: 900 });
      gsap.set("#finaleCard", { yPercent: -35, zIndex: 1 });
      gsap.set("#finaleHeader", { y: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
          defaults: { ease: "none" },
        })
        // 1. Slide card down into the pocket
        .to("#finaleCard", { yPercent: 0, duration: 0.45, ease: "power1.inOut" }, 0.05)
        // 2. Fold flap down over the card and pocket; the envelope, lowered (and shrunk if need be) so
        //    the open flap's seal clears the countdown, settles back as it closes
        .to("#finaleFlap", { rotationX: 0, duration: 0.4, ease: "power2.inOut" }, 0.5)
        .fromTo(
          "#finaleWrap",
          { y: () => measureFit(root).y, scale: () => measureFit(root).scale },
          { y: 0, scale: 1, duration: 0.4, ease: "power2.inOut" },
          0.5,
        )
        .set("#finaleFlap", { zIndex: 4 }, 0.7)
        // 3. Move countdown header down closer to the closed envelope
        .to("#finaleHeader", { y: 72, duration: 0.4, ease: "power1.inOut" }, 0.5)
        // 4. Settle envelope
        .to("#finaleWrap", { scale: 0.98, duration: 0.1, ease: "power1.out" }, 0.9);
    }, root);

    return () => ctx.revert();
  }, [enabled, rootRef]);
}
