import { ScrollTrigger } from "gsap/ScrollTrigger";

let frame = 0;

/**
 * Asks ScrollTrigger to re-measure on the next frame. Requests within a frame share one refresh,
 * which re-lays every pin and trigger on the page, so callers never stack them.
 */
export function requestRefresh(): void {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    ScrollTrigger.refresh();
  });
}
