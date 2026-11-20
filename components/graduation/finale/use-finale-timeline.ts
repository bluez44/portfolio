"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";
import { closedOffsets } from "./closed-spacing";
import { openFlapFit, type FlapLayout } from "./flap-clearance";

const bottomOf = (el: HTMLElement) => el.offsetTop + el.offsetHeight;

/** The stage's vertical layout; offsets ignore the transforms the timeline sets. */
function measureLayout(root: HTMLElement): FlapLayout | null {
  const get = (id: string) => root.querySelector<HTMLElement>(`#${id}`);
  const [header, wrap, flap, footer] = [get("finaleHeader"), get("finaleWrap"), get("finaleFlap"), get("finaleFooter")];
  if (!header || !wrap || !flap || !footer) return null;
  return {
    headerBottom: bottomOf(header),
    wrapTop: wrap.offsetTop,
    wrapBottom: bottomOf(wrap),
    footerTop: footer.offsetTop,
    flapHeight: flap.offsetHeight,
    sealHeight: flap.querySelector<HTMLElement>("[data-wax-seal]")?.offsetHeight ?? 0,
  };
}

const openFit = (root: HTMLElement) => {
  const layout = measureLayout(root);
  return layout ? openFlapFit(layout) : { y: 0, scale: 1 };
};

const closedFit = (root: HTMLElement) => {
  const layout = measureLayout(root);
  return layout ? closedOffsets(layout) : { header: 0, footer: 0 };
};

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
        const { header, footer } = closedFit(root);
        gsap.set("#finaleHeader", { y: header });
        gsap.set("#finaleFooter", { y: footer });
        return;
      }

      // Initial state before scrub: flap open, card sticking out
      gsap.set("#finaleFlap", { rotationX: 180, zIndex: 0, transformOrigin: "50% 0%", transformPerspective: 900 });
      gsap.set("#finaleCard", { yPercent: -35, zIndex: 1 });
      gsap.set(["#finaleHeader", "#finaleFooter"], { y: 0 });

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
          { y: () => openFit(root).y, scale: () => openFit(root).scale },
          { y: 0, scale: 1, duration: 0.4, ease: "power2.inOut" },
          0.5,
        )
        .set("#finaleFlap", { zIndex: 4 }, 0.7)
        // 3. Draw the countdown and the closing text in around the closed envelope
        .to("#finaleHeader", { y: () => closedFit(root).header, duration: 0.4, ease: "power1.inOut" }, 0.5)
        .to("#finaleFooter", { y: () => closedFit(root).footer, duration: 0.4, ease: "power1.inOut" }, 0.5)
        // 4. Settle envelope
        .to("#finaleWrap", { scale: 0.98, duration: 0.1, ease: "power1.out" }, 0.9);
    }, root);

    return () => ctx.revert();
  }, [enabled, rootRef]);
}
