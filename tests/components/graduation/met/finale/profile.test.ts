import { describe, expect, it } from "vitest";
import { BATCH_ENTER_UNITS, BATCH_GAP_UNITS, batchUnits, finaleUnits, pinEnd, pinVh } from "@/components/graduation/met/finale/constants";
import { memoryLayout, memorySchedule } from "@/components/graduation/met/finale/memory-layout";
import { noteFinaleScroll } from "@/components/graduation/met/finale/note-finale";
import { COMPACT_FINALE, WIDE_FINALE, finaleProfile } from "@/components/graduation/met/finale/profile";

describe("finaleProfile", () => {
  it("picks the phone profile only when compact", () => {
    expect(finaleProfile(true)).toBe(COMPACT_FINALE);
    expect(finaleProfile(false)).toBe(WIDE_FINALE);
  });
});

describe("wide finale (desktop) keeps its pin length", () => {
  it("dims each photo as the next one settles, the last one as the together photo does", () => {
    const { enters, dims, together } = memorySchedule(5);
    expect(dims[0][0]).toBe(enters[1][1]);
    expect(dims[4][0]).toBe(together[1]);
    for (const [from, to] of dims) expect(Number.isFinite(from) && to > from).toBe(true);
  });
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
  it("pins long enough for every group, and no shorter than its base", () => {
    expect(pinVh(1, COMPACT_FINALE)).toBe(COMPACT_FINALE.baseVh);
    expect(pinVh(16, COMPACT_FINALE)).toBeGreaterThan(pinVh(8, COMPACT_FINALE));
    expect(finaleUnits(16, COMPACT_FINALE)).toBeCloseTo(batchUnits(16, 4));
  });
  it("leaves the pile's spots to place-pile, keeping the together photo's own", () => {
    const { slots, together } = memoryLayout(6, COMPACT_FINALE);
    expect(slots.every((s) => s.phone === null && s.drift === 0 && s.spin === 0)).toBe(true);
    expect(together.phone).not.toBeNull();
  });
  it("shows every photo, in a pile, four at a time", () => {
    expect(COMPACT_FINALE.layout).toBe("pile");
    expect(COMPACT_FINALE.batch).toBe(4);
  });
  it("gives each group its rise, then a gap before the next, dimming it as the next one rises", () => {
    const units = finaleUnits(16, COMPACT_FINALE);
    const { enters, dims, together } = memorySchedule(16, COMPACT_FINALE);
    expect(enters[3][1]).toBe(enters[0][1]);
    expect((enters[0][1] - enters[0][0]) * units).toBeCloseTo(BATCH_ENTER_UNITS);
    expect((enters[4][0] - enters[0][1]) * units).toBeCloseTo(BATCH_GAP_UNITS);
    expect(dims[0][0]).toBeCloseTo(enters[4][0]);
    expect(dims[15][0]).toBeCloseTo(together[0]);
  });
  it("schedules every photo inside the timeline, in order", () => {
    const { enters, together, revealAt } = memorySchedule(16, COMPACT_FINALE);
    for (const [from, to] of [...enters, together]) {
      expect(from).toBeGreaterThanOrEqual(0);
      expect(to).toBeLessThanOrEqual(1);
      expect(to).toBeGreaterThan(from);
    }
    enters.slice(1).forEach(([from], i) => expect(from).toBeGreaterThan(enters[i][0]));
    expect(together[1]).toBeLessThan(revealAt);
  });
});
