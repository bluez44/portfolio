import { describe, expect, it } from "vitest";
import { MEMORY_LOOK, memoryLook } from "@/components/graduation/met/finale/constants";
import { COMPACT_FINALE, WIDE_FINALE } from "@/components/graduation/met/finale/profile";

describe("MEMORY_LOOK", () => {
  it("leaves photos sharp at rest without non-zero blur", () => {
    expect(MEMORY_LOOK.to.filter).not.toMatch(/blur\((?!0px)/);
    expect(MEMORY_LOOK.dim.card.filter).not.toMatch(/blur\((?!0px)/);
  });
});

describe("memoryLook", () => {
  it("returns MEMORY_LOOK for full tier with WIDE_FINALE", () => {
    expect(memoryLook("full", WIDE_FINALE)).toBe(MEMORY_LOOK);
  });

  it("uses no filters and dims with a veil, keeping cards opaque, on the lite tier and on phones", () => {
    for (const look of [memoryLook("lite", WIDE_FINALE), memoryLook("full", COMPACT_FINALE)]) {
      expect("filter" in look.from || "filter" in look.to).toBe(false);
      expect(look.to.opacity).toBe(1);
      expect(look.dim).toEqual({ veil: expect.any(Number) });
    }
  });
});
