/**
 * The personal-note finale: the note pins when its top reaches `ARRIVE_AT` of the viewport, then
 * over `PIN_VH` viewport heights of scroll it grows (outline + scale) and holds. Shared by the trail
 * animation and the graduation character so the character moves in step with the card.
 */
export const ARRIVE_AT = 0.4;
export const PIN_VH = 2.8;
/** ScrollTrigger line where the badge reaches the note and the note pins. */
export const ARRIVE_LINE = `top ${ARRIVE_AT * 100}%`;
export const PIN_END = `+=${PIN_VH * 100}%`;

/** Timeline units: the grow phase (outline + scale together), then the hold before the pin releases. */
export const GROW = 0.85;
export const HOLD = 0.6;
export const GROW_EASE = "power1.inOut";

/** px between the card edge and the drawn outline; the outline's corner radius follows the card's. */
export const OUTLINE_GAP = 8;
const CARD_RADIUS = 14;
export const OUTLINE_RADIUS = CARD_RADIUS + OUTLINE_GAP;

/** The grown note's target share of the viewport height (it never shrinks)… */
export const NOTE_VIEWPORT_HEIGHT = 0.3;
/** …but it stops before it would be wider than the viewport minus this gutter on each side… */
export const NOTE_SIDE_GUTTER = 16;
/** …and never balloons past this. */
export const NOTE_MAX_SCALE = 1.25;

/** Shared width; tied to the viewport height too so the row fits between the header and the note. */
export const MEMORY_PHOTO_WIDTH = "clamp(78px, min(22vw, 22vh), 200px)";

/**
 * Memory photos that gather in a loose row above the pinned note, one after another, each mostly
 * clear of its neighbours (centres ~22vw apart, one photo wide). `x` is the photo centre's offset
 * (vw) from the viewport centre; `rest` is where its top settles, as a share of the viewport
 * height; `enter` is the share of the pin over which it rises from below the viewport to rest.
 */
export const MEMORY_PHOTOS = [
  { x: -33, rot: -5, rest: 0.12, enter: [0.02, 0.32] },
  { x: 11, rot: 3, rest: 0.15, enter: [0.18, 0.48] },
  { x: -11, rot: -2, rest: 0.1, enter: [0.34, 0.64] },
  { x: 33, rot: 5, rest: 0.14, enter: [0.5, 0.8] },
] as const;

/** Top of a memory photo before it rises, as a share of the viewport height (just below it). */
export const MEMORY_ENTER_FROM = 1.05;
/** A photo surfaces faded like an old memory and settles clear. */
export const MEMORY_LOOK = {
  from: { opacity: 0, filter: "blur(6px) sepia(0.85)" },
  to: { opacity: 0.95, filter: "blur(0px) sepia(0.25)" },
} as const;
