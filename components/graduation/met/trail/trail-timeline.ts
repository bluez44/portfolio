import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { TrailElements } from "../elements";
import { ARRIVE_LINE } from "../finale/constants";
import { START_LINE } from "./constants";
import { interpolate, type ScrollKey } from "./scroll-mapping";

/**
 * Scroll from the column's start line until the note reaches the arrival line drives the badge
 * along the path (drawing it behind). Scroll maps to path fraction through `keysFor`, recomputed on
 * every refresh, so the badge can be timed to meet each card at a chosen screen position.
 * Requires ScrollTrigger, MotionPathPlugin and DrawSVGPlugin.
 */
export function createTrailTimeline(
  { root, end, base, draw, rider }: TrailElements,
  keysFor: (trigger: ScrollTrigger) => ScrollKey[],
  onFraction: (fraction: number) => void,
): ScrollTrigger {

  const ride = gsap
    .timeline({ paused: true, defaults: { ease: "none" } })
    .fromTo(draw, { drawSVG: "0%" }, { drawSVG: "100%" }, 0)
    .to(rider, { motionPath: { path: base, align: base, alignOrigin: [0.5, 0.5] } }, 0);

  let keys: ScrollKey[] = [];
  const apply = (progress: number) => {
    const fraction = interpolate(keys, progress);
    ride.progress(fraction);
    onFraction(fraction);
  };

  // No scrub smoothing (Lenis already smooths scrolling): the finale pin engages at the exact scroll
  // position, so a lagging badge would still be mid-path while the card is already pinned.
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: START_LINE,
    endTrigger: end,
    end: ARRIVE_LINE,
    onRefresh: (self) => {
      ride.invalidate();
      keys = keysFor(self);
      apply(self.progress);
    },
    onUpdate: (self) => apply(self.progress),
  });
  keys = keysFor(trigger);
  apply(trigger.progress);
  return trigger;
}
