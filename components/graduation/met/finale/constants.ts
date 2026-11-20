import type { PerfTier } from "@/lib/browser/perf-tier";
import { WIDE_FINALE, type FinaleProfile } from "./profile";

/**
 * The personal-note finale: the note pins when its top reaches `ARRIVE_AT` of the viewport, then
 * over `pinVh` viewport heights of scroll (per `FinaleProfile`) it grows (outline + scale)
 * and holds. Shared by the trail animation and the graduation character so the character moves in
 * step with the card.
 */
export const ARRIVE_AT = 0.4;
/** Reference pin length: timeline units are scaled against it so scroll speed per unit stays constant. */
export const PIN_VH = WIDE_FINALE.baseVh;
/** ScrollTrigger line where the badge reaches the note and the note pins. */
export const ARRIVE_LINE = `top ${ARRIVE_AT * 100}%`;

/** Timeline units: the grow phase (outline + scale together), then the hold before the pin releases. */
export const GROW = 1;
export const HOLD = 2.5;
export const GROW_EASE = "power1.inOut";

export const BASE_MEMORIES = 4;

/** Timeline units before the first photo rises, and after the last one: a gap, then all clear until the pin releases. */
export const FIRST_ENTER_UNITS = 0.07;
export const REVEAL_GAP_UNITS = 0.07;
export const REVEAL_HOLD_UNITS = 0.5;
/** Photos arriving in groups (`profile.batch`): each group rises over this many units, then the next waits this long. */
export const BATCH_ENTER_UNITS = 0.52;
export const BATCH_GAP_UNITS = 0.2;

/** Timeline units the grouped photos need: every group (the together photo last) with the gaps between them. */
export const batchUnits = (memoryCount: number, size: number): number =>
  FIRST_ENTER_UNITS + Math.ceil(memoryCount / size) * (BATCH_ENTER_UNITS + BATCH_GAP_UNITS) + BATCH_ENTER_UNITS + REVEAL_GAP_UNITS + REVEAL_HOLD_UNITS;

/** Pin length (viewport heights); with groups it grows until every group gets its full time. */
export const pinVh = (memoryCount: number, profile: FinaleProfile = WIDE_FINALE): number => {
  if (profile.batch) return Math.max(profile.baseVh, (batchUnits(memoryCount, profile.batch) * PIN_VH) / (GROW + HOLD));
  return Math.min(profile.maxVh, profile.baseVh + Math.max(0, memoryCount - BASE_MEMORIES) * profile.extraVhPerMemory);
};
/** Scale total units with pin length so scroll speed per timeline unit stays constant. */
export const finaleUnits = (memoryCount: number, profile: FinaleProfile = WIDE_FINALE): number =>
  ((GROW + HOLD) * pinVh(memoryCount, profile)) / PIN_VH;
export const pinEnd = (memoryCount: number, profile: FinaleProfile = WIDE_FINALE): string =>
  `+=${pinVh(memoryCount, profile) * 100}%`;

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
export type Spot = { x: number; rest: number };
export type Range = readonly [min: number, max: number];
export type MemoryZone = { axis: "x" | "rest"; weight: number; rest: Range; x: { phone: Range | null; wide: Range } };
export type MemorySlot = {
  width: string;
  rot: number;
  /** `null`: placed at runtime instead, spot and width (the phone pile, see place-pile). */
  phone: Spot | null;
  wide: Spot;
  drift: number;
  spin: number;
  enter: readonly [number, number];
};

export const MEMORY_WIDTHS = [
  "clamp(100px, min(30vw, 20vh), 260px)",
  "clamp(95px, min(28vw, 20vh), 240px)",
  "clamp(88px, min(26vw, 19vh), 220px)",
  "clamp(100px, min(30vw, 19vh), 260px)",
] as const;

const BAND_X = { phone: [-28, 28], wide: [-38, 38] } as const satisfies MemoryZone["x"];
const SIDE_REST: Range = [0.3, 0.55];

export const MEMORY_ZONES = {
  top: { axis: "x", weight: 0.35, rest: [0.04, 0.14], x: BAND_X },
  right: { axis: "rest", weight: 0.15, rest: SIDE_REST, x: { phone: null, wide: [30, 38] } },
  // 0.74 ceiling keeps photos away from the section bottom.
  bottom: { axis: "x", weight: 0.35, rest: [0.7, 0.74], x: BAND_X },
  left: { axis: "rest", weight: 0.15, rest: SIDE_REST, x: { phone: null, wide: [-38, -30] } },
} as const satisfies Record<string, MemoryZone>;
/** Share of the gap between neighbouring ring points a photo may shift, so it never crosses into its neighbour. */
export const MEMORY_JITTER = 0.3;

export const MEMORY_MOTION_RANGE = {
  rot: [-6, 6],
  drift: [-18, 18],
  spin: [-12, 12],
} as const satisfies Record<"rot" | "drift" | "spin", Range>;

/** The guest's photo with the owner: last in, ~50% larger than normal memories, resting on the right side of the note's top edge. */
export const TOGETHER_PHOTO = {
  width: "clamp(145px, min(42vw, 30vh), 380px)",
  rot: 2,
  // On phones: right of the docked badge, so it never hides the caption, and clear of the note's text.
  phone: { x: 20, rest: 0.12 },
  wide: { x: 14, rest: 0.095 },
  drift: -5,
  spin: 6,
  enter: [0.72, 0.96],
} satisfies MemorySlot;

/** Top of a memory photo before it rises, as a share of the viewport height (just below it). */
export const MEMORY_ENTER_FROM = 1.05;
/** A photo surfaces faded like an old memory and settles clear. */
export const MEMORY_LOOK = {
  from: { opacity: 0, filter: "blur(6px) sepia(0.85)" },
  to: { opacity: 0.95, filter: "blur(0px) sepia(0.25)" },
  dimmed: { opacity: 0.45, filter: "blur(0px) sepia(0.7)" },
} as const;

export type MemoryLook = {
  from: { opacity: number; filter?: string };
  to: { opacity: number; filter?: string };
  dimmed: { opacity: number; filter?: string };
};

const MEMORY_LOOK_LITE: MemoryLook = {
  from: { opacity: MEMORY_LOOK.from.opacity },
  to: { opacity: MEMORY_LOOK.to.opacity },
  dimmed: { opacity: MEMORY_LOOK.dimmed.opacity },
};

/** Whether finale photos animate filters: never on the lite tier, nor where the profile turns them off. */
export const animatesFilters = (tier: PerfTier, profile: FinaleProfile): boolean => tier !== "lite" && profile.filters;

export function memoryLook(tier: PerfTier, profile: FinaleProfile): MemoryLook {
  return animatesFilters(tier, profile) ? MEMORY_LOOK : MEMORY_LOOK_LITE;
}
export const DIM_UNITS = 0.25;
export const REVEAL_UNITS = 0.3;
