import { describe, expect, it } from "vitest";
import { buildBeats, envelopeSideX, targetPose } from "./beats";
import type { SectionMetrics } from "./types";

const M: SectionMetrics = { vh: 1000, stageTop: 0, stageScroll: 3200, metTop: 4200, metHeight: 1500, endsTop: 5700, endsHeight: 1200, rsvpTop: 6900 };

describe("buildBeats", () => {
  const beats = buildBeats(M, 0.8);
  it("creates nine strictly increasing beats ≥ 40px apart", () => {
    expect(beats).toHaveLength(9);
    beats.slice(1).forEach((b, i) => expect(b.s - beats[i].s).toBeGreaterThanOrEqual(40));
  });
  it("starts waving on the right, ends tossing", () => {
    expect(beats[0]).toMatchObject({ act: "wave", x: 0.8 });
    expect(beats.at(-1)).toMatchObject({ act: "toss", x: 0.62 });
  });
  it("forces spacing when sections are tiny", () => {
    const tiny = buildBeats({ ...M, metHeight: 0, endsHeight: 0 }, 0.5);
    tiny.slice(1).forEach((b, i) => expect(b.s).toBeGreaterThan(tiny[i].s));
  });
});

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

describe("envelopeSideX", () => {
  it("never exceeds 1", () => {
    expect(envelopeSideX({ viewportW: 400, envelopeW: 344, halfW: 2, scale: 0.6 })).toBeLessThanOrEqual(1);
  });
});
