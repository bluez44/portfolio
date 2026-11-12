import { describe, expect, it } from "vitest";
import type { Beat } from "@/components/graduation/character/types";
import { lineAt } from "@/components/graduation/character/choreography/narration";

describe("lineAt", () => {
  const beats: Beat[] = [
    { s: 1000, x: 0.8, ry: -0.5, act: "wave", say: "wave" },
    { s: 2000, x: 0.8, ry: -0.5, act: "wave", say: "wave" },
    { s: 3000, x: -0.8, ry: 0.5, act: "bow", say: "bow" },
    { s: 4000, x: 0.66, ry: -0.35, act: "sit", say: "desk" },
  ];

  it("returns null when beats are empty", () => {
    expect(lineAt([], 1500)).toBeNull();
  });

  it("returns first beat say before the first beat scroll", () => {
    expect(lineAt(beats, 500)).toBe("wave");
  });

  it("returns last beat say beyond the last beat scroll", () => {
    expect(lineAt(beats, 5000)).toBe("desk");
  });

  it("returns say when holding static between beats with same position and action", () => {
    expect(lineAt(beats, 1500)).toBe("wave");
  });

  it("returns say in fade-out window before walking starts", () => {
    // between 2000 and 3000 (span 1000), FADE is 0.18 (t <= 0.18 -> s <= 2180)
    expect(lineAt(beats, 2100)).toBe("wave");
  });

  it("returns null while actively walking between stations", () => {
    // t = 0.5 -> s = 2500
    expect(lineAt(beats, 2500)).toBeNull();
  });

  it("returns target beat say in fade-in window after arrival", () => {
    // t >= 1 - 0.18 = 0.82 -> s >= 2820
    expect(lineAt(beats, 2900)).toBe("bow");
  });
});
