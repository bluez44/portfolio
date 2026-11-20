import { describe, expect, it } from "vitest";
import { createFrameGovernor } from "@/components/graduation/shared/three/frame-governor";

describe("createFrameGovernor", () => {
  it("always allows busy frames regardless of interval", () => {
    const shouldRender = createFrameGovernor(30);
    expect(shouldRender(0, true)).toBe(true);
    expect(shouldRender(0.005, true)).toBe(true);
    expect(shouldRender(0.01, true)).toBe(true);
  });

  it("allows the first idle frame, skips frames within 1/idleFps, and allows the next after the interval", () => {
    const shouldRender = createFrameGovernor(10);
    expect(shouldRender(1, false)).toBe(true);
    expect(shouldRender(1.05, false)).toBe(false);
    expect(shouldRender(1.099, false)).toBe(false);
    expect(shouldRender(1.1, false)).toBe(true);
    expect(shouldRender(1.15, false)).toBe(false);
    expect(shouldRender(1.2, false)).toBe(true);
  });

  it("measures idle intervals from the last rendered frame including busy frames", () => {
    const shouldRender = createFrameGovernor(10);
    expect(shouldRender(0, true)).toBe(true);
    expect(shouldRender(0.05, true)).toBe(true);
    expect(shouldRender(0.12, false)).toBe(false);
    expect(shouldRender(0.15, false)).toBe(true);
  });
});
