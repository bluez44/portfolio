import { describe, expect, it } from "vitest";
import { outlineHalves } from "./outline-path";

describe("outlineHalves", () => {
  it("starts both halves at the top centre and ends them at the bottom centre", () => {
    const [left, right] = outlineHalves(200, 100, 20);
    for (const d of [left, right]) {
      expect(d.startsWith("M 100.0 1.5")).toBe(true);
      expect(d.endsWith("H 100.0")).toBe(true);
    }
    expect(right).toContain("V 78.5"); // right edge down to the bottom-right corner
    expect(left).toContain("H 21.5"); // left half heads left first
  });

  it("clamps the radius to fit small boxes", () => {
    const [, right] = outlineHalves(40, 20, 50);
    expect(right).toContain("A 8.5 8.5");
  });
});
