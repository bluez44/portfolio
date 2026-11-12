type FitInput = { width: number; height: number; availW: number; availH: number; max: number };

/** Largest scale (up to `max`) at which a `width` × `height` box fits inside `availW` × `availH`. */
export function fitScale({ width, height, availW, availH, max }: FitInput): number {
  if (!width || !height) return max;
  return Math.min(max, availW / width, availH / height);
}
