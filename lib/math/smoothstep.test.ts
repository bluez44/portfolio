import { describe, expect, it } from "vitest";
import { smoothstep } from "./smoothstep";

describe("smoothstep", () => {
  it("clamps outside 0..1 and eases in between", () => {
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(2)).toBe(1);
    expect(smoothstep(0.5)).toBe(0.5);
    expect(smoothstep(0.25)).toBeCloseTo(0.15625);
  });
});
