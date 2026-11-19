import { describe, expect, it } from "vitest";
import { BEE_NAMES, getRandomBeeNames } from "@/lib/bee-alias";

describe("getRandomBeeNames", () => {
  it("returns empty array when count is 0 or negative", () => {
    expect(getRandomBeeNames(0)).toEqual([]);
    expect(getRandomBeeNames(-5)).toEqual([]);
  });

  it("returns unique names when count is less than pool size", () => {
    const count = 15;
    const names = getRandomBeeNames(count);
    expect(names).toHaveLength(count);

    // All names must be unique
    const unique = new Set(names);
    expect(unique.size).toBe(count);

    // All names must come from BEE_NAMES
    for (const name of names) {
      expect(BEE_NAMES).toContain(name);
    }
  });

  it("returns all unique names when count equals pool size", () => {
    const names = getRandomBeeNames(BEE_NAMES.length);
    expect(names).toHaveLength(BEE_NAMES.length);
    expect(new Set(names).size).toBe(BEE_NAMES.length);
  });

  it("produces randomized order on different runs", () => {
    const run1 = getRandomBeeNames(20);
    const run2 = getRandomBeeNames(20);
    // Probability of two random 20-element shuffles being identical is negligible (1/20!)
    expect(run1).not.toEqual(run2);
  });

  it("does not repeat names until the entire pool has been exhausted", () => {
    const testPool = ["Ong A", "Ong B", "Ong C", "Ong D"];
    const count = 10;
    const names = getRandomBeeNames(count, testPool);

    expect(names).toHaveLength(10);

    // Cycle 1: index 0..3 must contain all 4 unique pool elements
    const cycle1 = names.slice(0, 4);
    expect(new Set(cycle1).size).toBe(4);
    for (const item of testPool) {
      expect(cycle1).toContain(item);
    }

    // Cycle 2: index 4..7 must contain all 4 unique pool elements
    const cycle2 = names.slice(4, 8);
    expect(new Set(cycle2).size).toBe(4);
    for (const item of testPool) {
      expect(cycle2).toContain(item);
    }

    // Remaining: index 8..9 must contain 2 unique items from testPool
    const cycle3 = names.slice(8, 10);
    expect(new Set(cycle3).size).toBe(2);

    // Adjacent elements across cycle boundaries must not be identical
    expect(names[4]).not.toBe(names[3]);
    expect(names[8]).not.toBe(names[7]);
  });
});
