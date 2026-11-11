/**
 * Pure hex-grid math for the wishes honeycomb, ported from the
 * "Graduation Invitation" design comp. Axial coordinates (q, r),
 * flat 121.24x140 hexes on a 131.64x114 lattice.
 */

export const HEX_W = 121.24;
export const HEX_H = 140;
const COL = 131.64;
const ROW = 114;

export const HEX_POINTS = "60.62,1 120.24,35.5 120.24,104.5 60.62,139 1,104.5 1,35.5";

export type HoneycombLayout = "ring" | "organic";

export type HexSlot = {
  left: number;
  top: number;
  kind: "hub" | "wish" | "empty";
  /** honey-drop decoration on some empty cells */
  drop: boolean;
  /** index into the wishes array when kind === "wish" */
  wishIndex: number;
};

/** Deterministic pseudo-random in [0,1) — same cell always looks the same. */
function hash(q: number, r: number, s: number): number {
  const v = Math.sin(q * 127.1 + r * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
}

function hexDistance(q: number, r: number): number {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

const RING_DIRS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
] as const;

function ringCoords(k: number): [number, number][] {
  if (!k) return [[0, 0]];
  let q = -k;
  let r = k;
  const out: [number, number][] = [];
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < k; j++) {
      out.push([q, r]);
      q += RING_DIRS[i][0];
      r += RING_DIRS[i][1];
    }
  return out;
}

function toSlot(q: number, r: number, kind: HexSlot["kind"], drop: boolean, wishIndex = -1): HexSlot {
  return {
    left: COL * (q + r / 2) - HEX_W / 2,
    top: ROW * r - HEX_H / 2,
    kind,
    drop,
    wishIndex,
  };
}

/** Which ring-2 positions hold wishes in the design's concentric layout. */
const RING2_WISH_INDICES = new Set([0, 1, 3, 4, 6, 7, 9, 10]);

function buildRingSlots(wishCount: number): HexSlot[] {
  const slots: HexSlot[] = [toSlot(0, 0, "hub", false)];
  let assigned = 0;
  // Grow rings until every wish has a cell, then pad one ring of empties
  // (minimum 3 rings so the comb never looks bare).
  for (let k = 1; assigned < wishCount || k <= 3; k++) {
    const coords = ringCoords(k);
    const outermost = assigned >= wishCount;
    coords.forEach(([q, r], i) => {
      const wishable = k === 1 || (k === 2 ? RING2_WISH_INDICES.has(i) : i % 3 !== 2);
      if (!outermost && wishable && assigned < wishCount) {
        slots.push(toSlot(q, r, "wish", false, assigned++));
      } else {
        slots.push(toSlot(q, r, "empty", outermost && hash(q, r, 3) > 0.8));
      }
    });
    if (outermost) break;
  }
  return slots;
}

function buildOrganicSlots(wishCount: number): HexSlot[] {
  // Radius grows with the number of wishes; the design used R=4 for 14.
  let radius = 4;
  while (radius * 2.2 * radius < wishCount * 2.2 + 3) radius++;
  const all: { q: number; r: number; sc: number }[] = [];
  for (let q = -radius; q <= radius; q++)
    for (let r = -radius; r <= radius; r++) {
      const d = hexDistance(q, r);
      if (d <= radius) all.push({ q, r, sc: d ? d + hash(q, r, 1) * 2.4 + r * 0.22 - q * 0.1 : -1 });
    }
  all.sort((a, b) => a.sc - b.sc);
  const keep = all.slice(0, Math.max(31, Math.round(wishCount * 2.2) + 3));
  const pool = new Set(
    keep
      .slice(1)
      .map((c) => ({ c, k: hash(c.q, c.r, 2) }))
      .sort((a, b) => a.k - b.k)
      .slice(0, wishCount)
      .map((o) => o.c),
  );
  let assigned = 0;
  return keep.map((c, i) => {
    if (i === 0) return toSlot(c.q, c.r, "hub", false);
    if (pool.has(c)) return toSlot(c.q, c.r, "wish", false, assigned++);
    return toSlot(c.q, c.r, "empty", hash(c.q, c.r, 3) > 0.8);
  });
}

export function buildHoneycomb(layout: HoneycombLayout, wishCount: number): HexSlot[] {
  return layout === "organic" ? buildOrganicSlots(wishCount) : buildRingSlots(wishCount);
}

/** Bounding size of the comb, used to fit it inside the viewport. */
export function honeycombExtent(slots: HexSlot[]): [number, number] {
  let maxX = 0;
  let maxY = 0;
  for (const s of slots) {
    maxX = Math.max(maxX, Math.abs(s.left), Math.abs(s.left + HEX_W));
    maxY = Math.max(maxY, Math.abs(s.top), Math.abs(s.top + HEX_H));
  }
  return [maxX * 2 + 120, maxY * 2 + 100];
}
