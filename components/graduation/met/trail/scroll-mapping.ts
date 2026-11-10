/** A point of the scroll → trail mapping: at scroll progress `at` (0..1) the badge is at path fraction `value`. */
export type ScrollKey = { at: number; value: number };

/** Gap kept between consecutive keys so every segment has a positive width. */
const MIN_STEP = 1e-3;

/**
 * Keys anchored at (0, 0) and (1, 1) with the given stops in between, forced strictly increasing in
 * both `at` and `value` (a stop that would go backwards is nudged forward) and kept inside 0..1.
 */
export function scrollKeys(stops: ScrollKey[]): ScrollKey[] {
  const keys: ScrollKey[] = [{ at: 0, value: 0 }];
  for (const stop of stops) {
    const prev = keys[keys.length - 1];
    const at = Math.min(1 - MIN_STEP, Math.max(prev.at + MIN_STEP, stop.at));
    const value = Math.min(1 - MIN_STEP, Math.max(prev.value + MIN_STEP, stop.value));
    if (at <= prev.at || value <= prev.value) continue;
    keys.push({ at, value });
  }
  keys.push({ at: 1, value: 1 });
  return keys;
}

/** Piecewise-linear lookup of `at` (clamped to 0..1) through increasing `keys`. */
export function interpolate(keys: ScrollKey[], at: number): number {
  const x = Math.min(1, Math.max(0, at));
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (x <= b.at) return a.value + ((x - a.at) / (b.at - a.at)) * (b.value - a.value);
  }
  return keys[keys.length - 1]?.value ?? x;
}
