import { describe, expect, it } from "vitest";
import { rendererOptions } from "@/components/graduation/shared/three/renderer";

describe("rendererOptions", () => {
  it("uses antialias and caps pixel ratio at 2 on full tier", () => {
    expect(rendererOptions("full", 3)).toEqual({ antialias: true, pixelRatio: 2 });
  });

  it("disables antialias and caps pixel ratio at 1.25 on lite tier", () => {
    expect(rendererOptions("lite", 3)).toEqual({ antialias: false, pixelRatio: 1.25 });
    expect(rendererOptions("lite", 1)).toEqual({ antialias: false, pixelRatio: 1 });
  });

  it("respects custom DPR caps", () => {
    const caps = { full: 1.5, lite: 1 };
    expect(rendererOptions("full", 3, caps)).toEqual({ antialias: true, pixelRatio: 1.5 });
    expect(rendererOptions("lite", 3, caps)).toEqual({ antialias: false, pixelRatio: 1 });
  });
});
