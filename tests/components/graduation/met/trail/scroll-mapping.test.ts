import { describe, expect, it } from "vitest";
import { interpolate, scrollKeys } from "@/components/graduation/met/trail/scroll-mapping";

describe("scrollKeys", () => {
  it("anchors the stops between (0, 0) and (1, 1)", () => {
    expect(scrollKeys([{ at: 0.2, value: 0.5 }])).toEqual([
      { at: 0, value: 0 },
      { at: 0.2, value: 0.5 },
      { at: 1, value: 1 },
    ]);
  });

  it("keeps keys strictly increasing and inside 0..1", () => {
    const keys = scrollKeys([
      { at: -0.3, value: 0.2 },
      { at: 0.1, value: 0.1 },
      { at: 1.4, value: 0.9 },
    ]);
    keys.slice(1).forEach((k, i) => {
      expect(k.at).toBeGreaterThan(keys[i].at);
      expect(k.value).toBeGreaterThan(keys[i].value);
    });
    expect(keys.every((k) => k.at >= 0 && k.at <= 1 && k.value >= 0 && k.value <= 1)).toBe(true);
  });
});

describe("interpolate", () => {
  const keys = scrollKeys([{ at: 0.2, value: 0.5 }]);

  it("hits each key exactly", () => {
    expect(interpolate(keys, 0)).toBe(0);
    expect(interpolate(keys, 0.2)).toBeCloseTo(0.5);
    expect(interpolate(keys, 1)).toBe(1);
  });

  it("is linear within a segment, so the first leg runs faster here", () => {
    expect(interpolate(keys, 0.1)).toBeCloseTo(0.25);
    expect(interpolate(keys, 0.6)).toBeCloseTo(0.75);
  });

  it("clamps outside 0..1", () => {
    expect(interpolate(keys, -1)).toBe(0);
    expect(interpolate(keys, 2)).toBe(1);
  });
});
