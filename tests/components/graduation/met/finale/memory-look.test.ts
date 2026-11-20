import { describe, expect, it } from "vitest";
import { MEMORY_LOOK } from "@/components/graduation/met/finale/constants";

describe("MEMORY_LOOK", () => {
  it("leaves photos sharp at rest without non-zero blur", () => {
    expect(MEMORY_LOOK.to.filter).not.toMatch(/blur\((?!0px)/);
    expect(MEMORY_LOOK.dimmed.filter).not.toMatch(/blur\((?!0px)/);
  });
});
