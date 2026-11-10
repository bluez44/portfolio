import { svgNum as f } from "@/lib/svg/svg-number";

/**
 * Rounded-rect outline split into two halves that both start at the top centre and meet at the
 * bottom centre, so drawing them together spreads from the top to both sides and closes below.
 * `s` insets the path so a stroke of width 2·s stays inside the w×h box.
 */
export function outlineHalves(w: number, h: number, r: number, s = 1.5): [left: string, right: string] {
  const R = Math.max(0, Math.min(r, w / 2 - s, h / 2 - s));
  const cx = f(w / 2);
  const [l, t, rt, b] = [s, s, w - s, h - s];
  const right = `M ${cx} ${f(t)} H ${f(rt - R)} A ${f(R)} ${f(R)} 0 0 1 ${f(rt)} ${f(t + R)} V ${f(b - R)} A ${f(R)} ${f(R)} 0 0 1 ${f(rt - R)} ${f(b)} H ${cx}`;
  const left = `M ${cx} ${f(t)} H ${f(l + R)} A ${f(R)} ${f(R)} 0 0 0 ${f(l)} ${f(t + R)} V ${f(b - R)} A ${f(R)} ${f(R)} 0 0 0 ${f(l + R)} ${f(b)} H ${cx}`;
  return [left, right];
}
