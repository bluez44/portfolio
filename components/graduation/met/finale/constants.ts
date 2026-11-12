/**
 * The personal-note finale: the note pins when its top reaches `ARRIVE_AT` of the viewport, then
 * over `PIN_VH` viewport heights of scroll it grows (outline + scale) and holds. Shared by the trail
 * animation and the graduation character so the character moves in step with the card.
 */
export const ARRIVE_AT = 0.4;
export const PIN_VH = 1.4;
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

/**
 * Photos drifting up behind the pinned note, scattered unevenly. `inset` is vw from their side
 * (negative peeks off-screen); `from`/`to` are vh offsets from the pin's top over the whole pin, so
 * each starts below the viewport, ends above it, and its travel (from − to) sets its parallax speed.
 */
export const PARALLAX_PHOTOS = [
  { side: "left", inset: -4, width: "clamp(130px, 36vw, 300px)", from: 0.75, to: -0.9, rot: -5 },
  { side: "right", inset: 3, width: "clamp(110px, 30vw, 240px)", from: 1.15, to: -0.95, rot: 4 },
  { side: "left", inset: 9, width: "clamp(100px, 26vw, 220px)", from: 1.6, to: -0.9, rot: 3 },
  { side: "right", inset: -6, width: "clamp(130px, 38vw, 320px)", from: 2.0, to: -1.0, rot: -3 },
] as const;
