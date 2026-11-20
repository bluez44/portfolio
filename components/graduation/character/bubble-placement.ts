/** Where the speech bubble sits relative to the character's head. */
export type BubblePlacement = { side: "above" | "beside"; gap: number };

/** Edge of the bubble its tail sticks out of, pointing at the head. */
export type TailSide = "bottom" | "left" | "right";

export type BubbleBox = { left: number; top: number; tail: TailSide; tailOffset: number };

const EDGE_MARGIN = 12;
const TAIL_INSET = 16;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/**
 * Top-left corner (px) of a `w`×`h` bubble kept inside a `viewportW` wide screen: centred `gap` px
 * above the head, or `gap` px beside it on the side facing the middle of the screen. Above the head,
 * the tail offset (from the bottom edge's centre) shifts so it still points at the head when the
 * bubble is clamped.
 */
export function placeBubble(
  head: { x: number; y: number },
  { w, h }: { w: number; h: number },
  viewportW: number,
  { side, gap }: BubblePlacement,
): BubbleBox {
  if (side === "above") {
    const left = clamp(head.x - w / 2, EDGE_MARGIN, viewportW - EDGE_MARGIN - w);
    return { left, top: head.y - gap - h, tail: "bottom", tailOffset: clamp(head.x - (left + w / 2), TAIL_INSET - w / 2, w / 2 - TAIL_INSET) };
  }
  const toLeft = head.x > viewportW / 2;
  const left = clamp(toLeft ? head.x - gap - w : head.x + gap, EDGE_MARGIN, viewportW - EDGE_MARGIN - w);
  return { left, top: head.y - h / 2, tail: toLeft ? "right" : "left", tailOffset: 0 };
}
