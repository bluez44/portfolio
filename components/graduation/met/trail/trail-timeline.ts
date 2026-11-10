import gsap from "gsap";
import type { TrailElements } from "../elements";
import { ARRIVE_LINE } from "../finale/constants";
import { START_LINE } from "./constants";

/**
 * Scrubbed by scroll from the column's start line until the note reaches the arrival line: draws
 * the path and moves the badge along it. Requires ScrollTrigger, MotionPathPlugin and DrawSVGPlugin.
 */
export function createTrailTimeline(
  { root, end, base, draw, rider }: TrailElements,
  onProgress: (progress: number) => void,
): gsap.core.Timeline {
  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: START_LINE,
      endTrigger: end,
      end: ARRIVE_LINE,
      // No scrub lag (Lenis already smooths scrolling): the finale pin engages at the exact scroll
      // position, so a lagging badge would still be mid-path while the card is already pinned,
      // then catch up to a path end that has scrolled away from the card and jump onto it.
      scrub: true,
      invalidateOnRefresh: true,
    },
    onUpdate: () => onProgress(timeline.progress()),
  });
  return timeline
    .fromTo(draw, { drawSVG: "0%" }, { drawSVG: "100%" }, 0)
    // immediateRender puts the badge on the path start before the trail is scrolled into range.
    .to(rider, { motionPath: { path: base, align: base, alignOrigin: [0.5, 0.5] }, immediateRender: true }, 0);
}
