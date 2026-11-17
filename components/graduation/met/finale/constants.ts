/**
 * The personal-note finale: the note pins when its top reaches `ARRIVE_AT` of the viewport, then
 * over `pinVh` viewport heights of scroll (growing with memory count) it grows (outline + scale)
 * and holds. Shared by the trail animation and the graduation character so the character moves in
 * step with the card.
 */
export const ARRIVE_AT = 0.4;
export const PIN_VH = 2.8;
/** ScrollTrigger line where the badge reaches the note and the note pins. */
export const ARRIVE_LINE = `top ${ARRIVE_AT * 100}%`;

/** Timeline units: the grow phase (outline + scale together), then the hold before the pin releases. */
export const GROW = 1;
export const HOLD = 2.5;
export const GROW_EASE = "power1.inOut";

export const BASE_MEMORIES = 4;
export const EXTRA_PIN_VH_PER_MEMORY = 0.35;
export const MAX_PIN_VH = 8;

export const pinVh = (memoryCount: number): number =>
  Math.min(MAX_PIN_VH, PIN_VH + Math.max(0, memoryCount - BASE_MEMORIES) * EXTRA_PIN_VH_PER_MEMORY);
/** Scale total units with pin length so scroll speed per timeline unit stays constant. */
export const finaleUnits = (memoryCount: number): number => ((GROW + HOLD) * pinVh(memoryCount)) / PIN_VH;
export const pinEnd = (memoryCount: number): string => `+=${pinVh(memoryCount) * 100}%`;

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
 * Placement and motion slot for a memory photo (`memory-layout` generates positions and `enter`
 * timing). `phone`/`wide` place it below/above the 760px breakpoint (`x` vw from viewport centre,
 * `rest` share of viewport height); each rises from below the viewport over `enter` (share of
 * the timeline), drifting by `drift` (vw) and turning by `spin` (deg) to settle at `rot`.
 */
type Spot = { x: number; rest: number };
export type Range = readonly [min: number, max: number];
export type MemoryZone = { rest: Range; x: { phone: Range | null; wide: Range } };
export type MemorySlot = { width: string; rot: number; phone: Spot; wide: Spot; drift: number; spin: number; enter: readonly [number, number] };

export const MEMORY_WIDTHS = [
  "clamp(100px, min(30vw, 20vh), 260px)",
  "clamp(95px, min(28vw, 20vh), 240px)",
  "clamp(88px, min(26vw, 19vh), 220px)",
  "clamp(100px, min(30vw, 19vh), 260px)",
] as const;

const BAND_X = { phone: [-28, 28], wide: [-38, 38] } as const satisfies MemoryZone["x"];
const SIDE_REST: Range = [0.3, 0.55];

export const MEMORY_ZONES = {
  top: { rest: [0.04, 0.14], x: BAND_X },
  // 0.74 ceiling keeps photos away from the section bottom.
  bottom: { rest: [0.7, 0.74], x: BAND_X },
  left: { rest: SIDE_REST, x: { phone: null, wide: [-38, -30] } },
  right: { rest: SIDE_REST, x: { phone: null, wide: [30, 38] } },
} as const satisfies Record<string, MemoryZone>;

export const MEMORY_MOTION_RANGE = {
  rot: [-6, 6],
  drift: [-18, 18],
  spin: [-12, 12],
} as const satisfies Record<"rot" | "drift" | "spin", Range>;

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

/** Top of a memory photo before it rises, as a share of the viewport height (just below it). */
export const MEMORY_ENTER_FROM = 1.05;
/** A photo surfaces faded like an old memory and settles clear. */
export const MEMORY_LOOK = {
  from: { opacity: 0, filter: "blur(6px) sepia(0.85)" },
  to: { opacity: 0.95, filter: "blur(0px) sepia(0.25)" },
  dimmed: { opacity: 0.45, filter: "blur(1.5px) sepia(0.7)" },
} as const;
