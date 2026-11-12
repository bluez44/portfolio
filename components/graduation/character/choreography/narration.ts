import type { Beat, NarrationKey } from "../types";
import { FADE } from "./constants";

/**
 * Returns the speech bubble narration key when scroll position `y` is within
 * a resting pose window. Returns `null` when the character is walking/blending
 * between distinct positions.
 */
export function lineAt(beats: Beat[], y: number): NarrationKey | null {
  if (beats.length === 0) return null;
  if (y <= beats[0].s) return beats[0].say ?? null;
  const last = beats[beats.length - 1];
  if (y >= last.s) return last.say ?? null;

  let i = 0;
  while (y > beats[i + 1].s) i++;
  const a = beats[i];
  const b = beats[i + 1];

  // Holding the same station and pose
  if (a.x === b.x && a.act === b.act) {
    return a.say ?? null;
  }

  const span = b.s - a.s;
  if (span <= 0) return a.say ?? null;

  const t = (y - a.s) / span;

  // In fade-out window of a:
  if (t <= FADE) {
    return a.say ?? null;
  }

  // In fade-in window of b:
  if (t >= 1 - FADE) {
    return b.say ?? null;
  }

  // Actively moving / walking
  return null;
}
