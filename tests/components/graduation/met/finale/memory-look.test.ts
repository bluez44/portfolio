import { describe, expect, it } from "vitest";
import { MEMORY_LOOK, memoryLook } from "@/components/graduation/met/finale/constants";

describe("MEMORY_LOOK", () => {
  it("leaves photos sharp at rest without non-zero blur", () => {
    expect(MEMORY_LOOK.to.filter).not.toMatch(/blur\((?!0px)/);
    expect(MEMORY_LOOK.dimmed.filter).not.toMatch(/blur\((?!0px)/);
  });
});

describe("memoryLook", () => {
  it("returns MEMORY_LOOK for full tier", () => {
    expect(memoryLook("full")).toBe(MEMORY_LOOK);
  });

  it("drops filter keys while preserving opacities for lite tier", () => {
    const lite = memoryLook("lite");
    for (const key of ["from", "to", "dimmed"] as const) {
      expect("filter" in lite[key]).toBe(false);
      expect(lite[key].opacity).toBe(MEMORY_LOOK[key].opacity);
    }
  });
});
