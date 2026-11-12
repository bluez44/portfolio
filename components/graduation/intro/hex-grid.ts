export type HexCell = { q: number; r: number; d: number };

/** Axial hex coordinates within `radius` of the centre, in the design's iteration order; `d` is the ring. */
export function hexGrid(radius: number): HexCell[] {
  const cells: HexCell[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) > radius) continue;
      cells.push({ q, r, d: Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) });
    }
  }
  return cells;
}
