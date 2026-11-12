import { offsetWithin } from "@/lib/browser/offset-within";
import type { TrailElements } from "../elements";
import { DOCK_GAP, START_INSET } from "./constants";
import { buildTrail, type Point } from "./trail-path";

/** Each card's dock (column coordinates), the path length (px) to it, and the trail's total length. */
export type TrailMetrics = { docks: Point[]; stops: number[]; total: number };

/** The section's top-right corner (inset), in the trail column's coordinates; outside the column. */
function sectionCorner({ root, section }: TrailElements): Point {
  const s = section.getBoundingClientRect();
  const r = root.getBoundingClientRect();
  return { x: s.right - r.left - START_INSET, y: s.top - r.top + START_INSET };
}

/** Beside each card on its open side, halfway to the viewport edge when that side is narrow (phones). */
function cardDocks({ root, cards }: TrailElements): Point[] {
  const rootLeft = root.getBoundingClientRect().left;
  return cards.map((card) => {
    const { x, y } = offsetWithin(card, root);
    const left = card.dataset.side === "left";
    const free = left ? window.innerWidth - rootLeft - (x + card.offsetWidth) : rootLeft + x;
    const gap = Math.max(0, Math.min(DOCK_GAP, free / 2));
    return { x: left ? x + card.offsetWidth + gap : x - gap, y: y + card.offsetHeight / 2 };
  });
}

/** The note's top centre. `end` never pins (its child does), so its offset is stable whatever the pin state. */
function noteTop({ root, end }: TrailElements): Point {
  const e = offsetWithin(end, root);
  return { x: e.x + end.offsetWidth / 2, y: e.y };
}

/**
 * Lays the trail out from current layout: from the section's top-right corner it winds past each
 * card and ends on the note. Measures where each card sits along it.
 */
export function layoutTrail(els: TrailElements): TrailMetrics {
  const docks = cardDocks(els);
  const { d, prefixes } = buildTrail([sectionCorner(els), ...docks, noteTop(els)], els.root.offsetWidth);

  const { base, draw } = els;
  const stops = docks.map((_, i) => {
    base.setAttribute("d", prefixes[i + 1]);
    return base.getTotalLength();
  });
  base.setAttribute("d", d);
  draw.setAttribute("d", d);
  return { docks, stops, total: base.getTotalLength() };
}
