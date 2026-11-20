import { smoothstep } from "@/lib/math/smoothstep";

export type CarouselFocus = {
  /** Each card's activation (0..1): 1 at the centre, easing to 0 at `reach` away. */
  values: number[];
  /** The card nearest the centre; -1 when there are none. */
  active: number;
};

/** Activation of each card from the distance (px) between its centre and the scroller's centre. */
export function carouselFocus(cardCenters: readonly number[], center: number, reach: number): CarouselFocus {
  let active = -1;
  let nearest = Infinity;
  const values = cardCenters.map((c, i) => {
    const distance = Math.abs(c - center);
    if (distance < nearest) {
      nearest = distance;
      active = i;
    }
    return reach > 0 ? smoothstep(1 - distance / reach) : Number(distance === 0);
  });
  return { values, active };
}

/** The card `step` away from `active`, kept within `0..count - 1`. */
export function stepIndex(active: number, step: number, count: number): number {
  if (count <= 0) return -1;
  return Math.min(count - 1, Math.max(0, active + step));
}
