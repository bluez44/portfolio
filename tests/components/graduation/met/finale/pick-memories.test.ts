import { describe, expect, it } from "vitest";
import { pickMemories } from "@/components/graduation/met/finale/pick-memories";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("pickMemories", () => {
  it("keeps a short list as is", () => {
    expect(pickMemories(range(5), 8)).toEqual(range(5));
  });
  it("samples evenly, keeping the first and the last", () => {
    expect(pickMemories(range(16), 8)).toEqual([0, 2, 4, 6, 9, 11, 13, 15]);
  });
  it("never repeats or exceeds the cap", () => {
    const picked = pickMemories(range(9), 8);
    expect(picked).toHaveLength(8);
    expect(new Set(picked).size).toBe(8);
  });
  it("shows everything with no cap", () => {
    expect(pickMemories(range(16), Infinity)).toEqual(range(16));
  });
  it("handles tiny caps", () => {
    expect(pickMemories(range(4), 1)).toEqual([0]);
    expect(pickMemories(range(4), 0)).toEqual([]);
  });
});
