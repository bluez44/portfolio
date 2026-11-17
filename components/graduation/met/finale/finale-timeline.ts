import gsap from "gsap";
import { MOBILE_BREAKPOINT } from "../../character/scene/constants";
import { SELECTORS, type FinaleElements } from "../elements";
import {
  ARRIVE_LINE,
  DIM_UNITS,
  GROW,
  GROW_EASE,
  MEMORY_ENTER_FROM,
  MEMORY_LOOK,
  REVEAL_UNITS,
  finaleUnits,
  pinEnd,
  type MemorySlot,
} from "./constants";
import { memoryLayout } from "./memory-layout";
import { noteScaleFor } from "./note-finale";

function enterPhoto(tl: gsap.core.Timeline, el: HTMLElement, slot: MemorySlot, span: number, wide: () => boolean): void {
  const [from, to] = slot.enter;
  tl.fromTo(
    el,
    {
      x: () => (slot.drift * window.innerWidth) / 100,
      y: () => (MEMORY_ENTER_FROM - (wide() ? slot.wide : slot.phone).rest) * window.innerHeight,
      xPercent: -50,
      rotation: slot.rot + slot.spin,
      ...MEMORY_LOOK.from,
    },
    { x: 0, y: 0, xPercent: -50, rotation: slot.rot, ...MEMORY_LOOK.to, duration: span * (to - from), ease: "power2.out" },
    span * from,
  );
}

function dimPhoto(tl: gsap.core.Timeline, el: HTMLElement, at: number, duration: number): void {
  // immediateRender: false prevents overriding the preceding enter tween before `at` and restores cleanly on reverse scrub.
  tl.fromTo(el, { ...MEMORY_LOOK.to }, { ...MEMORY_LOOK.dimmed, duration, immediateRender: false }, at);
}

function revealPhotos(tl: gsap.core.Timeline, els: HTMLElement[], at: number, duration: number): void {
  tl.fromTo(els, { ...MEMORY_LOOK.dimmed }, { ...MEMORY_LOOK.to, duration, immediateRender: false }, at);
}

/**
 * Pins the note from the badge's arrival line and, scrubbed by scroll, draws the outline out from
 * the badge while the note scales up and slides to the viewport centre, then holds briefly.
 * Requires ScrollTrigger and DrawSVGPlugin to be registered.
 */
export function createFinaleTimeline({
  pin,
  note,
  dock,
  halves,
  photo,
  memoryLayer,
  memoryLayers = memoryLayer ? [memoryLayer] : [],
  memoryPhotos,
}: FinaleElements): gsap.core.Timeline {
  const memories = memoryPhotos.filter((el) => !el.matches(SELECTORS.memoryTogether));
  const together = memoryPhotos.find((el) => el.matches(SELECTORS.memoryTogether));
  const memoryCount = memories.length;

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
        end: pinEnd(memoryCount),
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

  tl.to({}, { duration: finaleUnits(memoryCount) - GROW }); // the finished card stays pinned a little before the next section

  if (memoryLayers.length > 0) {
    // The pin sits in a column; pull the layers back to the viewport's left edge.
    tl.set(memoryLayers, { x: () => -pin.getBoundingClientRect().left }, 0);
    // Placed within the pin's existing length, so the photos never change it.
    const span = tl.duration();
    const wide = () => window.innerWidth >= MOBILE_BREAKPOINT;
    const layout = memoryLayout(memoryCount);
    memories.forEach((el, i) => enterPhoto(tl, el, layout.slots[i], span, wide));
    if (together) {
      enterPhoto(tl, together, layout.together, span, wide);
    }
    const dimmed = together ? memories : memories.slice(0, -1);
    memories.forEach((el, i) => {
      const nextEnter = layout.slots[i + 1]?.enter ?? (together ? layout.together : null);
      if (nextEnter) {
        dimPhoto(tl, el, span * nextEnter[1], DIM_UNITS);
      }
    });
    if (dimmed.length > 0) {
      revealPhotos(tl, dimmed, span * layout.revealAt, REVEAL_UNITS);
    }
  }

  return tl;
}
