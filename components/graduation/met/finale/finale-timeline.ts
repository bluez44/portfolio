import gsap from "gsap";
import type { FinaleElements } from "../elements";
import { ARRIVE_LINE, GROW, GROW_EASE, HOLD, MEMORY_ENTER_FROM, MEMORY_LOOK, MEMORY_PHOTOS, PIN_END } from "./constants";
import { noteScaleFor } from "./note-finale";

/**
 * Pins the note from the badge's arrival line and, scrubbed by scroll, draws the outline out from
 * the badge while the note scales up and slides to the viewport centre, then holds briefly.
 * Requires ScrollTrigger and DrawSVGPlugin to be registered.
 */
export function createFinaleTimeline({ pin, note, dock, halves, photo, memoryLayer, memoryPhotos }: FinaleElements): gsap.core.Timeline {
  // Function values so `invalidateOnRefresh` recomputes them from the current viewport and layout.
  /** The note sits in the left column; slide it to the viewport's centre while it grows. */
  const shift = () => {
    const rect = pin.getBoundingClientRect(); // the pin itself is never scaled
    return window.innerWidth / 2 - (rect.left + rect.width / 2);
  };
  const scale = () =>
    noteScaleFor({ noteW: note.offsetWidth, noteH: note.offsetHeight, vw: window.innerWidth, vh: window.innerHeight });

  const tl = gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: pin,
        start: ARRIVE_LINE,
        end: PIN_END,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    // Outline and scale run together, so the outline grows with the card as it draws.
    .fromTo(
      halves,
      { drawSVG: "0%" },
      { drawSVG: "100%", duration: GROW, ease: GROW_EASE },
      0,
    )
    .fromTo(
      note,
      { x: 0, scale: 1 },
      { x: shift, scale, duration: GROW, ease: GROW_EASE },
      0,
    )
    // The docked badge isn't scaled, but follows the card's top centre (the scale origin).
    .fromTo(
      dock,
      { x: 0 },
      { x: shift, duration: GROW, ease: GROW_EASE },
      0,
    )
    .fromTo(
      dock,
      { scale: 1 },
      { scale: 1.5, duration: 0.36, ease: GROW_EASE },
      0,
    );

  if (photo) {
    tl.fromTo(
      photo,
      { filter: "sepia(1) blur(6px) brightness(1.6)", opacity: 0.35 },
      { filter: "sepia(0) blur(0px) brightness(1)", opacity: 1, duration: GROW, ease: GROW_EASE },
      0,
    );
  }

  tl.to({}, { duration: HOLD }); // the finished card stays pinned a little before the next section

  if (memoryLayer) {
    // The pin sits in a column; pull the layer back to the viewport's left edge.
    tl.set(memoryLayer, { x: () => -pin.getBoundingClientRect().left }, 0);
    // Placed within the pin's existing length, so the photos never change it.
    const span = tl.duration();
    memoryPhotos.forEach((el, i) => {
      const { rest, enter } = MEMORY_PHOTOS[i % MEMORY_PHOTOS.length];
      const [from, to] = enter;
      tl.fromTo(
        el,
        { y: () => (MEMORY_ENTER_FROM - rest) * window.innerHeight, ...MEMORY_LOOK.from },
        { y: 0, ...MEMORY_LOOK.to, duration: span * (to - from), ease: "power2.out" },
        span * from,
      );
    });
  }

  return tl;
}
