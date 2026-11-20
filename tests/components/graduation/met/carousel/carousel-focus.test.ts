import { describe, expect, it } from "vitest";
import { carouselFocus, stepIndex } from "@/components/graduation/met/carousel/carousel-focus";

describe("carouselFocus", () => {
  it("fully focuses the centred card and leaves cards a reach away idle", () => {
    const { values, active } = carouselFocus([-100, 200, 500], 200, 300);
    expect(active).toBe(1);
    expect(values).toEqual([0, 1, 0]);
  });

  it("eases between the two cards straddling the centre", () => {
    const { values, active } = carouselFocus([100, 400], 220, 300);
    expect(active).toBe(0);
    expect(values[0]).toBeGreaterThan(values[1]);
    expect(values[0]).toBeGreaterThan(0);
    expect(values[0]).toBeLessThan(1);
    expect(values[1]).toBeGreaterThan(0);
  });

  it("handles no cards", () => {
    expect(carouselFocus([], 200, 300)).toEqual({ values: [], active: -1 });
  });

  it("without a reach only the exactly centred card is focused", () => {
    expect(carouselFocus([200, 300], 200, 0).values).toEqual([1, 0]);
  });
});

describe("stepIndex", () => {
  it("steps and clamps to the cards", () => {
    expect(stepIndex(2, 1, 5)).toBe(3);
    expect(stepIndex(0, -1, 5)).toBe(0);
    expect(stepIndex(4, 1, 5)).toBe(4);
  });
  it("returns -1 with no cards", () => {
    expect(stepIndex(0, 1, 0)).toBe(-1);
  });
});
