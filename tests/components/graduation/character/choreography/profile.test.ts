import { describe, expect, it } from "vitest";
import type { SectionMetrics } from "@/components/graduation/character/types";
import { buildBeats } from "@/components/graduation/character/choreography/beats";
import { COMPACT_CHARACTER, WIDE_CHARACTER, characterProfile } from "@/components/graduation/character/choreography/profile";

const M: SectionMetrics = {
  vh: 800,
  stageTop: 0,
  stageScroll: 1600,
  metTop: 2400,
  metHeight: 2500,
  endsTop: 6700,
  endsHeight: 1200,
  rsvpTop: 8000,
  wishesTop: 9000,
  noteFinale: { start: 4000, grown: 4300, end: 5400, width: 360 },
};

describe("characterProfile", () => {
  it("picks the phone staging only when compact", () => {
    expect(characterProfile(true)).toBe(COMPACT_CHARACTER);
    expect(characterProfile(false)).toBe(WIDE_CHARACTER);
  });

  it("keeps phones in the bottom corners, and off stage during the note finale", () => {
    const { slots, stations } = COMPACT_CHARACTER;
    if (!slots) throw new Error("phones use fixed slots");
    const beats = buildBeats(M, { sx: slots.side, cheerX: slots.cheer, farewellX: slots.farewell }, stations);
    const cheering = beats.filter((b) => b.act === "cheer");
    expect(cheering.length).toBeGreaterThan(0);
    for (const b of cheering) expect(b.x).toBeGreaterThan(1);
    for (const b of beats.filter((b) => b.act !== "cheer")) expect(Math.abs(b.x)).toBe(1);
  });

  it("says farewell from the left corner on phones, facing the page", () => {
    const { slots, stations } = COMPACT_CHARACTER;
    if (!slots) throw new Error("phones use fixed slots");
    const beats = buildBeats({ ...M, finaleTop: 9500 }, { sx: slots.side, cheerX: slots.cheer, farewellX: slots.farewell }, stations);
    const farewell = beats.find((b) => b.say === "farewell");
    expect(farewell).toMatchObject({ x: slots.farewell, act: "wave" });
    expect(farewell!.x).toBeLessThan(0);
    expect(farewell!.ry).toBeGreaterThan(0);
  });

  it("leaves the wide stations as they were", () => {
    expect(buildBeats(M, { sx: 0.8, cheerX: 0.9 }, WIDE_CHARACTER.stations)).toEqual(buildBeats(M, { sx: 0.8, cheerX: 0.9 }));
  });
});
