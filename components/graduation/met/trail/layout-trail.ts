import { offsetWithin } from "@/lib/browser/offset-within";
import type { TrailElements } from "../elements";
import { APPROACH_LEFT, APPROACH_MAX_TURNS, APPROACH_MIN_TURNS, APPROACH_STEP, DOCK_GAP, START_INSET } from "./constants";
import { buildTrail, zigzag, type Point } from "./trail-path";

/** Path length (px) to each card's dock, and the trail's total length. */
export type TrailMetrics = { stops: number[]; total: number };

/** The section's top-right corner (inset), in the trail column's coordinates; outside the column. */
function sectionCorner({ root, section }: TrailElements): Point {
  const s = section.getBoundingClientRect();
  const r = root.getBoundingClientRect();
  return { x: s.right - r.left - START_INSET, y: s.top - r.top + START_INSET };
}

/** Beside each card on its open side. */
function cardDocks({ root, cards }: TrailElements): Point[] {
  const width = root.offsetWidth;
  return cards.map((card) => {
    const { x, y } = offsetWithin(card, root);
    const gap = Math.min(DOCK_GAP, (width - card.offsetWidth) / 2);
    const left = card.dataset.side === "left";
    return { x: left ? x + card.offsetWidth + gap : x - gap, y: y + card.offsetHeight / 2 };
  });
}

/** The note's top centre. `end` never pins (its child does), so its offset is stable whatever the pin state. */
function noteTop({ root, end }: TrailElements): Point {
  const e = offsetWithin(end, root);
  return { x: e.x + end.offsetWidth / 2, y: e.y };
}

/**
 * Lays the trail out from current layout: from the section's top-right corner it zigzags down to
 * the first card, passes beside each card, and ends on the note. Measures where each card sits along it.
 */
export function layoutTrail(els: TrailElements): TrailMetrics {
  const width = els.root.offsetWidth;
  const start = sectionCorner(els);
  const docks = cardDocks(els);
  const approach = zigzag(start, docks[0], {
    left: width * APPROACH_LEFT,
    right: start.x,
    step: APPROACH_STEP,
    min: APPROACH_MIN_TURNS,
    max: APPROACH_MAX_TURNS,
  });
  const { d, prefixes } = buildTrail([start, ...approach, ...docks, noteTop(els)], width);

  const { base, draw } = els;
  const firstDock = 1 + approach.length;
  const stops = docks.map((_, i) => {
    base.setAttribute("d", prefixes[firstDock + i]);
    return base.getTotalLength();
  });
  base.setAttribute("d", d);
  draw.setAttribute("d", d);
  return { stops, total: base.getTotalLength() };
}
