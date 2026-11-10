import { svgNum as f } from "@/lib/svg/svg-number";

export type Point = { x: number; y: number };

/** Cubic from `p` to `q` leaving and arriving vertically, so consecutive curves join smoothly. */
const curve = (p: Point, q: Point) => {
  const k = (q.y - p.y) * 0.5;
  return ` C ${f(p.x)} ${f(p.y + k)}, ${f(q.x)} ${f(q.y - k)}, ${f(q.x)} ${f(q.y)}`;
};

/**
 * Winding trail through `knots`. Between each pair it detours through a midpoint pushed alternately
 * left/right by `wobble × width`, so the line snakes instead of running straight from stop to stop.
 * Returns the full path and the path prefix ending at each knot (for measuring stop lengths).
 */
export function buildTrail(knots: Point[], width: number, wobble = 0.16): { d: string; prefixes: string[] } {
  if (knots.length === 0) return { d: "", prefixes: [] };
  const margin = Math.min(24, width / 4);
  let d = `M ${f(knots[0].x)} ${f(knots[0].y)}`;
  const prefixes = [d];
  for (let i = 1; i < knots.length; i++) {
    const a = knots[i - 1];
    const b = knots[i];
    const push = (i % 2 === 1 ? 1 : -1) * width * wobble;
    const mid = {
      x: Math.min(width - margin, Math.max(margin, (a.x + b.x) / 2 + push)),
      y: (a.y + b.y) / 2,
    };
    d += curve(a, mid) + curve(mid, b);
    prefixes.push(d);
  }
  return { d, prefixes };
}
