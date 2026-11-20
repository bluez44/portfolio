import { seededRandom } from "@/lib/graduation/seeded-random";
import { bandLayout } from "./band-layout";
import {
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
const FIRST_ENTER_UNITS = 0.07;
const ENTER_UNITS = 1.05;
const REVEAL_GAP_UNITS = 0.07;
const REVEAL_HOLD_UNITS = 0.5;
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

export function memorySchedule(count: number, profile: FinaleProfile = WIDE_FINALE): {
  enters: (readonly [number, number])[];
  together: readonly [number, number];
  revealAt: number;
} {
  // Convert fixed timeline-unit durations to fractions so each photo's scroll distance stays constant.
  const units = finaleUnits(count, profile);
  const firstStart = FIRST_ENTER_UNITS / units;
  const enterSpan = ENTER_UNITS / units;
  const revealAt = 1 - REVEAL_HOLD_UNITS / units;
  const togetherEnd = revealAt - REVEAL_GAP_UNITS / units;
  const togetherStart = togetherEnd - enterSpan;
  const step = (togetherStart - firstStart) / Math.max(1, count);

  const enters = Array.from({ length: count }, (_, i) => {
    const start = firstStart + i * step;
    return [start, start + enterSpan] as const;
  });

  return { enters, together: [togetherStart, togetherEnd], revealAt };
}

/** Band layout on phones: each photo (the together photo last) takes a band spot and rises straight up. */
function withBands(slots: Omit<MemorySlot, "enter">[]): Omit<MemorySlot, "enter">[] {
  const bands = bandLayout(slots.length);
  return slots.map((slot, i) => ({ ...slot, width: bands[i].width, phone: { x: bands[i].x, rest: bands[i].rest }, drift: 0, spin: 0 }));
}

export function memoryLayout(count: number, profile: FinaleProfile = WIDE_FINALE): { slots: MemorySlot[]; together: MemorySlot; revealAt: number } {
  const ring = [...memorySpots(count), TOGETHER_PHOTO];
  const spots = profile.layout === "bands" ? withBands(ring) : ring;
  const schedule = memorySchedule(count, profile);
  return {
    slots: spots.slice(0, count).map((spot, i) => ({ ...spot, enter: schedule.enters[i] })),
    together: { ...spots[count], enter: schedule.together },
    revealAt: schedule.revealAt,
  };
}
