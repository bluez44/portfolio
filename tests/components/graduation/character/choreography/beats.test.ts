import { describe, expect, it } from "vitest";
import type { SectionMetrics } from "@/components/graduation/character/types";
import { buildBeats, moveSpan } from "@/components/graduation/character/choreography/beats";
import { targetPose } from "@/components/graduation/character/choreography/target-pose";

const M: SectionMetrics = {
  vh: 1000,
  stageTop: 0,
  stageScroll: 3200,
  metTop: 4200,
  metHeight: 1500,
  endsTop: 5700,
  endsHeight: 1200,
  rsvpTop: 6900,
  wishesTop: 8100,
};

describe("buildBeats", () => {
  const beats = buildBeats(M, 0.8);
  it("creates eleven strictly increasing beats ≥ 40px apart", () => {
    expect(beats).toHaveLength(11);
    beats.slice(1).forEach((b, i) => expect(b.s - beats[i].s).toBeGreaterThanOrEqual(40));
  });
  it("starts waving on the right, ends reading honeycomb", () => {
    expect(beats[0]).toMatchObject({ act: "wave", x: 0.8, say: "wave" });
    expect(beats.at(-1)).toMatchObject({ act: "read", x: 0.62, say: "read" });
  });
  it("forces spacing when sections are tiny", () => {
    const tiny = buildBeats({ ...M, metHeight: 0, endsHeight: 0 }, 0.5);
    tiny.slice(1).forEach((b, i) => expect(b.s).toBeGreaterThan(tiny[i].s));
  });
  it("includes farewell beat when finaleTop is provided", () => {
    const withFinale = buildBeats({ ...M, finaleTop: 9500 }, 0.8);
    expect(withFinale.at(-1)).toMatchObject({ act: "wave", say: "farewell" });
  });
});

describe("buildBeats with the note finale", () => {
  const finale = { start: 5000, grown: 5500, end: 6000, width: 700 };
  const beats = buildBeats({ ...M, metHeight: 2500, endsTop: 6700, noteFinale: finale }, 0.8, 0.9);

  // How we met's bottom edge is at 6700: it shows 20px at scroll 5720 and reaches mid-screen at 6200.
  it("sits until the note pins and cheers beside it before heading for How it ends", () => {
    expect(beats).toHaveLength(13);
    expect(beats[5]).toMatchObject({ s: 5000, act: "sit", x: 0.66, say: "desk" });
    expect(beats[6]).toMatchObject({ s: 5300, act: "cheer", x: 0.9, say: "cheer" });
    expect(beats[7]).toMatchObject({ s: 5480, act: "cheer", x: 0.9, say: "cheer" });
    expect(beats[8]).toMatchObject({ s: 6440, act: "point", x: -0.66, say: "point" });
  });

  it("walks toward the note during its grow phase and cheers once there", () => {
    const walking = targetPose(beats, 5150)!;
    expect(walking.walk).toBeGreaterThan(0.9);
    expect(walking.dir).toBe(1);
    expect(targetPose(beats, 5400)).toMatchObject({ cheer: 1, sit: 0, walk: 0, x: 0.9 });
  });

  it("starts moving left once the bottom edge is 20px into view", () => {
    expect(targetPose(beats, 5720)!.x).toBeCloseTo(0.9);
    const leaving = targetPose(beats, 5760)!;
    expect(leaving.dir).toBe(-1);
    expect(leaving.x).toBeLessThan(0.9);
  });

  it("has arrived when the bottom edge reaches mid-screen", () => {
    expect(targetPose(beats, 6200)!.x).toBeCloseTo(-0.66);
  });
});

describe("buildBeats without the note finale", () => {
  it("moves the character from the desk over the same scroll window", () => {
    const beats = buildBeats(M, 0.8); // bottom edge at 5700
    expect(beats[5]).toMatchObject({ s: 4480, act: "sit" });
    expect(beats[6]).toMatchObject({ s: 5440, act: "point" });
  });
});

describe("moveSpan", () => {
  it("places beats so the move covers exactly [start, end]", () => {
    expect(moveSpan(1000, 1500)).toEqual([750, 1750]);
  });
});
