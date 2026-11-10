import { offsetWithin } from "@/lib/browser/offset-within";
import type { TrailElements } from "../elements";
import { DOCK_GAP, START_X } from "./constants";
import { buildTrail, type Point } from "./trail-path";

/** Path length (px) to each card's dock, and the trail's total length. */
export type TrailMetrics = { stops: number[]; total: number };

/** Knots: start top-right, beside each card on its open side, then the note's top centre. */
function trailKnots({ root, cards, end }: TrailElements): Point[] {
  const width = root.offsetWidth;
  const knots: Point[] = [{ x: width * START_X, y: 0 }];
  for (const card of cards) {
    const { x, y } = offsetWithin(card, root);
    const gap = Math.min(DOCK_GAP, (width - card.offsetWidth) / 2);
    const left = card.dataset.side === "left";
    knots.push({ x: left ? x + card.offsetWidth + gap : x - gap, y: y + card.offsetHeight / 2 });
  }
  // `end` never pins (its child does), so its offset is stable whatever the pin state.
  const e = offsetWithin(end, root);
  knots.push({ x: e.x + end.offsetWidth / 2, y: e.y });
  return knots;
}

/** Lays the trail out from current layout and measures where each card sits along it. */
export function layoutTrail(els: TrailElements): TrailMetrics {
  const { d, prefixes } = buildTrail(trailKnots(els), els.root.offsetWidth);
  const { base, draw, cards } = els;
  const stops = cards.map((_, i) => {
    base.setAttribute("d", prefixes[i + 1]);
    return base.getTotalLength();
  });
  base.setAttribute("d", d);
  draw.setAttribute("d", d);
  return { stops, total: base.getTotalLength() };
}
