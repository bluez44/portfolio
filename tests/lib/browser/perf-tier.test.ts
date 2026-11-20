import { describe, expect, it } from "vitest";
import { perfTierFor } from "@/lib/browser/perf-tier";

describe("perfTierFor", () => {
  it("returns lite for coarse-pointer devices with low core count", () => {
    expect(perfTierFor({ cores: 4, memoryGb: 8, coarsePointer: true, reducedMotion: false })).toBe("lite");
  });

  it("returns lite for coarse-pointer devices with low memory", () => {
    expect(perfTierFor({ cores: 8, memoryGb: 3, coarsePointer: true, reducedMotion: false })).toBe("lite");
  });

  it("returns full for capable coarse-pointer devices", () => {
    expect(perfTierFor({ cores: 8, memoryGb: 8, coarsePointer: true, reducedMotion: false })).toBe("full");
  });

  it("keeps fine-pointer devices on full even with few cores", () => {
    expect(perfTierFor({ cores: 2, coarsePointer: false, reducedMotion: false })).toBe("full");
  });

  it("returns lite when reduced motion is preferred", () => {
    expect(perfTierFor({ cores: 16, coarsePointer: false, reducedMotion: true })).toBe("lite");
  });

  it("treats unknown cores and memory as capable", () => {
    expect(perfTierFor({ coarsePointer: true, reducedMotion: false })).toBe("full");
  });
});
