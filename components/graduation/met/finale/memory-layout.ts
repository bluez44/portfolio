import { seededRandom } from "@/lib/graduation/seeded-random";
import { MEMORY_MOTION_RANGE, MEMORY_WIDTHS, MEMORY_ZONES, type MemorySlot, type MemoryZone, type Range } from "./constants";

type PhoneZone = MemoryZone & { x: { phone: Range } };

const LAYOUT_SEED = 42;
const WIDE_ZONES: readonly MemoryZone[] = Object.values(MEMORY_ZONES);
const PHONE_ZONES: readonly PhoneZone[] = WIDE_ZONES.filter((z): z is PhoneZone => z.x.phone !== null);

const between = (rnd: () => number, [min, max]: Range): number => min + rnd() * (max - min);

const pickOne = <T>(rnd: () => number, list: readonly T[]): T => list[Math.floor(rnd() * list.length)];

const pickZoneExcept = <T>(rnd: () => number, zones: readonly T[], previous?: T): T =>
  pickOne(rnd, previous === undefined ? zones : zones.filter((z) => z !== previous));

export function memorySpots(count: number): Omit<MemorySlot, "enter">[] {
  const rnd = seededRandom(LAYOUT_SEED);
  let prevWide: MemoryZone | undefined;
  let prevPhone: PhoneZone | undefined;

  return Array.from({ length: count }, () => {
    const wideZone = pickZoneExcept(rnd, WIDE_ZONES, prevWide);
    const phoneZone = pickZoneExcept(rnd, PHONE_ZONES, prevPhone);
    prevWide = wideZone;
    prevPhone = phoneZone;

    return {
      width: pickOne(rnd, MEMORY_WIDTHS),
      rot: between(rnd, MEMORY_MOTION_RANGE.rot),
      phone: { x: between(rnd, phoneZone.x.phone), rest: between(rnd, phoneZone.rest) },
      wide: { x: between(rnd, wideZone.x.wide), rest: between(rnd, wideZone.rest) },
      drift: between(rnd, MEMORY_MOTION_RANGE.drift),
      spin: between(rnd, MEMORY_MOTION_RANGE.spin),
    };
  });
}
