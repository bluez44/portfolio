/** Hermite smoothstep of `t` clamped to 0..1: eases in and out with zero slope at both ends. */
export function smoothstep(t: number): number {
  const v = Math.min(1, Math.max(0, t));
  return v * v * (3 - 2 * v);
}
