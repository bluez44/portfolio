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
export const GROW = 1;
export const HOLD = 2.5;
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
 * Memory photos that gather around the pinned note one after another and stay, scattered at
 * random-looking spots. `phone`/`wide` place them below/above the 760px breakpoint: `x` is the
 * photo centre's offset (vw) from the viewport centre, `rest` where its top settles (share of the
 * viewport height). Widths are also capped by the viewport height so short screens keep the note
 * clear. Each rises from below the viewport over `enter` (share of the pin), drifting in sideways
 * by `drift` (vw) and turning by `spin` (deg) before it settles at `rot`.
 */
type Spot = { x: number; rest: number };
export type MemorySlot = { width: string; rot: number; phone: Spot; wide: Spot; drift: number; spin: number; enter: readonly [number, number] };

export const MEMORY_PHOTOS: readonly MemorySlot[] = [
  { width: "clamp(100px, min(30vw, 20vh), 260px)", rot: -5, phone: { x: 25, rest: 0.105 }, wide: { x: -32, rest: 0.1 }, drift: -14, spin: -10, enter: [0.02, 0.3] },
  { width: "clamp(95px, min(28vw, 20vh), 240px)", rot: 4, phone: { x: 2, rest: 0.1 }, wide: { x: 16, rest: 0.1 }, drift: 18, spin: 12, enter: [0.14, 0.48] },
  { width: "clamp(88px, min(26vw, 19vh), 220px)", rot: 3, phone: { x: -28, rest: 0.77 }, wide: { x: -26, rest: 0.71 }, drift: 8, spin: -6, enter: [0.36, 0.62] },
  { width: "clamp(100px, min(30vw, 19vh), 260px)", rot: -3, phone: { x: 2, rest: 0.78 }, wide: { x: 4, rest: 0.71 }, drift: -10, spin: 8, enter: [0.46, 0.84] },
];

/** The guest's photo with the owner: last in, a touch larger, resting just above the note's top edge. */
export const TOGETHER_PHOTO: MemorySlot = {
  width: "clamp(100px, min(34vw, 22vh), 260px)",
  rot: -2,
  phone: { x: -20, rest: 0.146 },
  wide: { x: -12, rest: 0.095 },
  drift: 6,
  spin: -8,
  enter: [0.72, 0.96],
};

/** The memory layer renders the `MEMORY_PHOTOS` slots in order, then the together photo. */
export const memorySlot = (i: number): MemorySlot => MEMORY_PHOTOS[i] ?? TOGETHER_PHOTO;

/** Top of a memory photo before it rises, as a share of the viewport height (just below it). */
export const MEMORY_ENTER_FROM = 1.05;
/** A photo surfaces faded like an old memory and settles clear. */
export const MEMORY_LOOK = {
  from: { opacity: 0, filter: "blur(6px) sepia(0.85)" },
  to: { opacity: 0.95, filter: "blur(0px) sepia(0.25)" },
} as const;
