import { BODY_GAP, BODY_MARGIN, OPENED_CARD_SCALE } from "./constants";

type View = { viewportW: number; halfW: number; scale: number };

/** Horizontal slot (−1..1) that puts the character just outside a viewport-centred object `objectW` px wide. */
export function besideX({ viewportW, objectW, halfW, scale }: View & { objectW: number }): number {
  const usable = Math.max(0.1, halfW - BODY_MARGIN * scale);
  return Math.min(1, ((objectW / 2 / (viewportW / 2)) * halfW + BODY_GAP * scale) / usable);
}

/** Horizontal slot (−1..1) that keeps the character just outside the opened invitation card. */
export function envelopeSideX({ envelopeW, ...view }: View & { envelopeW: number }): number {
  return besideX({ ...view, objectW: envelopeW * OPENED_CARD_SCALE });
}
