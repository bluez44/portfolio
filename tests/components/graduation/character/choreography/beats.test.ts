import { describe, expect, it } from "vitest";
import type { SectionMetrics } from "@/components/graduation/character/types";
import { buildBeats } from "@/components/graduation/character/choreography/beats";
import { targetPose } from "@/components/graduation/character/choreography/target-pose";

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

describe("buildBeats with the note finale", () => {
  const finale = { start: 5000, grown: 5500, end: 6000, width: 700 };
  const beats = buildBeats({ ...M, metHeight: 2500, endsTop: 6700, noteFinale: finale }, 0.8, 0.9);

  it("sits until the note pins, cheers beside it while it grows, holds until the pin ends", () => {
    expect(beats).toHaveLength(11);
    expect(beats[5]).toMatchObject({ s: 5000, act: "sit", x: 0.66 });
    expect(beats[6]).toMatchObject({ s: 5300, act: "cheer", x: 0.9 });
    expect(beats[7]).toMatchObject({ s: 6000, act: "cheer", x: 0.9 });
    expect(beats[8]).toMatchObject({ act: "point" });
  });

  it("walks toward the note during its grow phase and cheers once there", () => {
    const walking = targetPose(beats, 5150)!;
    expect(walking.walk).toBeGreaterThan(0.9);
    expect(walking.dir).toBe(1);
    expect(targetPose(beats, 5700)).toMatchObject({ cheer: 1, sit: 0, walk: 0, x: 0.9 });
  });
});
