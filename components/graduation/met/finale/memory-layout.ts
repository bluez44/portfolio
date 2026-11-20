import { seededRandom } from "@/lib/graduation/seeded-random";
import {
  BATCH_ENTER_UNITS,
  BATCH_GAP_UNITS,
  DIM_UNITS,
  FIRST_ENTER_UNITS,
  REVEAL_GAP_UNITS,
  REVEAL_HOLD_UNITS,
  MEMORY_JITTER,
  MEMORY_MOTION_RANGE,
  MEMORY_WIDTHS,
  MEMORY_ZONES,
  TOGETHER_PHOTO,
  finaleUnits,
  type MemorySlot,
  type MemoryZone,
  type Range,
} from "./constants";
import { WIDE_FINALE, type FinaleProfile } from "./profile";

type PhoneZone = MemoryZone & { x: { phone: Range } };

const LAYOUT_SEED = 42;
const GOLDEN = 0.6180339887;
const RING_START = 0.1;
const ENTER_UNITS = 1.05;
const WIDE_ZONES: readonly MemoryZone[] = Object.values(MEMORY_ZONES);
const PHONE_ZONES: readonly PhoneZone[] = WIDE_ZONES.filter((z): z is PhoneZone => z.x.phone !== null);

const frac = (n: number): number => ((n % 1) + 1) % 1;

const lerp = ([min, max]: Range, t: number): number => min + t * (max - min);

const between = (rnd: () => number, range: Range): number => lerp(range, rnd());

const pickOne = <T>(rnd: () => number, list: readonly T[]): T => list[Math.floor(rnd() * list.length)];

const ringSpot = <Z extends MemoryZone>(
  zones: readonly Z[],
  t: number,
  rnd: () => number,
  xRange: (zone: Z) => Range,
): { x: number; rest: number } => {
  const totalWeight = zones.reduce((sum, z) => sum + z.weight, 0);
  let target = t * totalWeight;
  let zoneIndex = zones.length - 1;
  for (let i = 0; i < zones.length; i++) {
    if (target < zones[i].weight || i === zones.length - 1) {
      zoneIndex = i;
      break;
    }
    target -= zones[i].weight;
  }
  const zone = zones[zoneIndex];
  const rawU = Math.min(1, target / zone.weight);
  const u = zoneIndex >= zones.length / 2 ? 1 - rawU : rawU;
  const xr = xRange(zone);
  return zone.axis === "x"
    ? { x: lerp(xr, u), rest: between(rnd, zone.rest) }
    : { x: between(rnd, xr), rest: lerp(zone.rest, u) };
};

/**
 * Places photos along the note's perimeter ring using the golden-ratio sequence so any count
 * spreads evenly without clumping and consecutive photos land far apart.
 */
export function memorySpots(count: number): Omit<MemorySlot, "enter">[] {
  const rnd = seededRandom(LAYOUT_SEED);

  return Array.from({ length: count }, (_, i) => {
    const t = frac(RING_START + i * GOLDEN + ((rnd() - 0.5) * MEMORY_JITTER) / count);
    const wide = ringSpot(WIDE_ZONES, t, rnd, (z) => z.x.wide);
    const phone = ringSpot(PHONE_ZONES, t, rnd, (z) => z.x.phone);

    return {
      width: pickOne(rnd, MEMORY_WIDTHS),
      rot: between(rnd, MEMORY_MOTION_RANGE.rot),
      phone,
      wide,
      drift: between(rnd, MEMORY_MOTION_RANGE.drift),
      spin: between(rnd, MEMORY_MOTION_RANGE.spin),
    };
  });
}

type Window = readonly [number, number];

export type MemorySchedule = {
  /** When each photo rises in, and the together photo after them (timeline fractions). */
  enters: Window[];
  together: Window;
  /** When each photo dims as later ones arrive (the last one: as the together photo arrives). */
  dims: Window[];
  /** When every dimmed photo clears again. */
  revealAt: number;
};

/** Share of a group's rise by which its photos start one after another. */
const BATCH_STAGGER = 0.12;

export function memorySchedule(count: number, profile: FinaleProfile = WIDE_FINALE): MemorySchedule {
  // Convert fixed timeline-unit durations to fractions so each photo's scroll distance stays constant.
  const units = finaleUnits(count, profile);
  const firstStart = FIRST_ENTER_UNITS / units;
  const revealAt = 1 - REVEAL_HOLD_UNITS / units;
  const togetherEnd = revealAt - REVEAL_GAP_UNITS / units;
  if (profile.batch) return batchSchedule(count, profile.batch, units, revealAt);

  const enterSpan = ENTER_UNITS / units;
  const togetherStart = togetherEnd - enterSpan;
  const step = (togetherStart - firstStart) / Math.max(1, count);
  const enters = Array.from({ length: count }, (_, i) => {
    const start = firstStart + i * step;
    return [start, start + enterSpan] as const;
  });
  const together = [togetherStart, togetherEnd] as const;
  // Each photo dims once the next one has settled.
  const dims = enters.map((_, i) => {
    const at = (enters[i + 1] ?? together)[1];
    return [at, at + DIM_UNITS / units] as const;
  });
  return { enters, together, dims, revealAt };
}

/**
 * Groups of `size` photos take turns (the together photo last): each rises over `BATCH_ENTER_UNITS`,
 * the next waits `BATCH_GAP_UNITS` more, and a group dims as the next one rises.
 */
function batchSchedule(count: number, size: number, units: number, revealAt: number): MemorySchedule {
  const groups = Math.ceil(count / size);
  const rise = BATCH_ENTER_UNITS / units;
  const groupStart = (g: number) => (FIRST_ENTER_UNITS + g * (BATCH_ENTER_UNITS + BATCH_GAP_UNITS)) / units;
  const enters = Array.from({ length: count }, (_, i) => {
    const g = Math.floor(i / size);
    return [groupStart(g) + (i % size) * rise * BATCH_STAGGER, groupStart(g) + rise] as const;
  });
  const dims = enters.map((_, i) => {
    const next = groupStart(Math.floor(i / size) + 1);
    return [next, next + rise / 2] as const;
  });
  return { enters, together: [groupStart(groups), groupStart(groups) + rise], dims, revealAt };
}

/** Pile layout on phones: spots and widths are measured at runtime (see place-pile); photos rise straight up. */
function forPile(slots: Omit<MemorySlot, "enter">[]): Omit<MemorySlot, "enter">[] {
  return slots.map((slot) => ({ ...slot, phone: null, drift: 0, spin: 0 }));
}

export function memoryLayout(count: number, profile: FinaleProfile = WIDE_FINALE): { slots: MemorySlot[]; together: MemorySlot; schedule: MemorySchedule } {
  const ring = memorySpots(count);
  const pile = profile.layout === "pile";
  const schedule = memorySchedule(count, profile);
  return {
    slots: (pile ? forPile(ring) : ring).map((spot, i) => ({ ...spot, enter: schedule.enters[i] })),
    together: { ...TOGETHER_PHOTO, ...(pile ? { drift: 0, spin: 0 } : {}), enter: schedule.together },
    schedule,
  };
}
