import { describe, expect, it } from "vitest";
import { buildTrail } from "./trail-path";

describe("buildTrail", () => {
  const knots = [
    { x: 300, y: 0 },
    { x: 200, y: 200 },
    { x: 100, y: 400 },
  ];

  it("starts at the first knot and ends at the last", () => {
    const { d } = buildTrail(knots, 400);
    expect(d.startsWith("M 300.0 0.0")).toBe(true);
    expect(d.endsWith("100.0 400.0")).toBe(true);
  });

  it("detours through a wobbled midpoint on each leg", () => {
    const { d } = buildTrail(knots, 400);
    // leg 1 midpoint: x = 250 + 0.16 * 400 = 314; leg 2: x = 150 - 64 = 86
    expect(d).toContain("314.0 100.0");
    expect(d).toContain("86.0 300.0");
  });

  it("keeps midpoints inside the width", () => {
    const { d } = buildTrail([{ x: 390, y: 0 }, { x: 390, y: 100 }], 400, 0.5);
    expect(d).toContain("376.0 50.0");
  });

  it("returns one prefix per knot, each extending the previous", () => {
    const { d, prefixes } = buildTrail(knots, 400);
    expect(prefixes).toHaveLength(3);
    expect(prefixes[2]).toBe(d);
    expect(prefixes[2].startsWith(prefixes[1])).toBe(true);
  });
});
