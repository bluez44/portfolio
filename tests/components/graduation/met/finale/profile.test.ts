import { describe, expect, it } from "vitest";
import { finaleUnits, pinEnd, pinVh } from "@/components/graduation/met/finale/constants";
import { memorySchedule } from "@/components/graduation/met/finale/memory-layout";
import { noteFinaleScroll } from "@/components/graduation/met/finale/note-finale";
import { COMPACT_FINALE, WIDE_FINALE, finaleProfile } from "@/components/graduation/met/finale/profile";

describe("finaleProfile", () => {
  it("picks the phone profile only when compact", () => {
    expect(finaleProfile(true)).toBe(COMPACT_FINALE);
    expect(finaleProfile(false)).toBe(WIDE_FINALE);
  });
});

describe("wide finale (desktop) keeps its pin length", () => {
  it("grows with the memory count up to 8 viewports", () => {
    expect(pinVh(4)).toBeCloseTo(2.8);
    expect(pinVh(16)).toBeCloseTo(7);
    expect(pinVh(40)).toBe(8);
    expect(pinEnd(16)).toBe(`+=${pinVh(16) * 100}%`);
  });
  it("defaults to the wide profile", () => {
    expect(pinVh(16, WIDE_FINALE)).toBe(pinVh(16));
    expect(finaleUnits(16, WIDE_FINALE)).toBe(finaleUnits(16));
    expect(memorySchedule(16, WIDE_FINALE)).toEqual(memorySchedule(16));
    expect(noteFinaleScroll(5000, 900, 16, WIDE_FINALE)).toEqual(noteFinaleScroll(5000, 900, 16));
  });
});

describe("compact finale (phones)", () => {
  it("stays short whatever the memory count", () => {
    expect(pinVh(4, COMPACT_FINALE)).toBeLessThanOrEqual(2);
    expect(pinVh(16, COMPACT_FINALE)).toBe(pinVh(4, COMPACT_FINALE));
  });
  it("caps the photos around the note", () => {
    expect(COMPACT_FINALE.maxMemories).toBe(8);
  });
  it("schedules every photo inside the timeline, in order", () => {
    const { enters, together, revealAt } = memorySchedule(COMPACT_FINALE.maxMemories, COMPACT_FINALE);
    for (const [from, to] of [...enters, together]) {
      expect(from).toBeGreaterThanOrEqual(0);
      expect(to).toBeLessThanOrEqual(1);
      expect(to).toBeGreaterThan(from);
    }
    enters.slice(1).forEach(([from], i) => expect(from).toBeGreaterThan(enters[i][0]));
    expect(together[1]).toBeLessThan(revealAt);
  });
});
