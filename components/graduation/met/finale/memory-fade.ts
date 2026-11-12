/** Peak opacity of a photo level with the note, so the note always reads first. */
const PEAK_OPACITY = 0.9;
const MAX_BLUR = 6;
const NEAR_SEPIA = 0.25;
const FAR_SEPIA = 0.85;

/**
 * How a drifting photo looks given its vertical distance (px) from the note's centre: clear and
 * warm when level with it, fading, blurring and yellowing like an old memory as it drifts away.
 * `range` is the distance at which it has fully faded.
 */
export function memoryLook(distance: number, range: number): { opacity: number; filter: string } {
  const t = Math.max(0, Math.min(1, 1 - Math.abs(distance) / range));
  const near = t * t * (3 - 2 * t);
  const sepia = FAR_SEPIA - (FAR_SEPIA - NEAR_SEPIA) * near;
  return { opacity: PEAK_OPACITY * near, filter: `blur(${((1 - near) * MAX_BLUR).toFixed(2)}px) sepia(${sepia.toFixed(2)})` };
}
