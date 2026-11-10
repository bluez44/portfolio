import { describe, expect, it } from "vitest";
import type { SectionMetrics } from "../types";
import { buildBeats } from "./beats";
import { targetPose } from "./target-pose";

const M: SectionMetrics = { vh: 1000, stageTop: 0, stageScroll: 3200, metTop: 4200, metHeight: 1500, endsTop: 5700, endsHeight: 1200, rsvpTop: 6900 };

describe("targetPose", () => {
  const beats = buildBeats(M, 0.8);
  it("clamps before the first and after the last beat", () => {
    expect(targetPose(beats, -100)).toMatchObject({ wave: 1, x: 0.8, walk: 0 });
    expect(targetPose(beats, 99999)).toMatchObject({ toss: 1, x: 0.62 });
  });
  it("walks between beats on different sides", () => {
    const mid = (beats[1].s + beats[2].s) / 2;
    const pose = targetPose(beats, mid)!;
    expect(pose.walk).toBeGreaterThan(0.9);
    expect(pose.dir).toBe(-1);
    expect(pose.x).toBeCloseTo(0, 5);
  });
  it("holds a pose between two identical beats", () => {
    const pose = targetPose(beats, (beats[4].s + beats[5].s) / 2)!;
    expect(pose).toMatchObject({ sit: 1, walk: 0, x: 0.66 });
  });
  it("returns null with no beats", () => {
    expect(targetPose([], 0)).toBeNull();
  });
});
