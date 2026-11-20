import { describe, expect, it } from "vitest";
import { MAX_COLUMNS, OVERLAP, SPAN_VW, bandGrid, bandLayout, itemExtent } from "@/components/graduation/met/finale/band-layout";
import { memoryLayout } from "@/components/graduation/met/finale/memory-layout";
import { COMPACT_FINALE, WIDE_FINALE } from "@/components/graduation/met/finale/profile";

describe("bandGrid", () => {
  it("uses as few rows as possible, then as few columns", () => {
    expect(bandGrid(9)).toEqual({ rows: 2, columns: 5 });
    expect(bandGrid(8)).toEqual({ rows: 2, columns: 4 });
    expect(bandGrid(3)).toEqual({ rows: 1, columns: 3 });
    expect(bandGrid(11)).toEqual({ rows: 3, columns: 4 });
  });
});

describe("itemExtent", () => {
  it("fits n items in the length with neighbours overlapping by exactly OVERLAP at most", () => {
    for (const n of [1, 2, 4, 5]) {
      const e = itemExtent(300, n);
      const step = e * (1 - OVERLAP);
      expect(e + (n - 1) * step).toBeCloseTo(300);
      if (n > 1) expect(1 - step / e).toBeCloseTo(OVERLAP);
    }
  });
});

describe("bandLayout", () => {
  it("alternates between the band above and the band below the note", () => {
    const spots = bandLayout(6);
    spots.forEach((s, i) => expect(s.top.includes("--note-h")).toBe(i % 2 === 1));
  });

  it("spaces columns so neighbours overlap by at most OVERLAP and stay on screen", () => {
    const top = bandLayout(18).filter((_, i) => i % 2 === 0);
    const firstRow = top.slice(0, MAX_COLUMNS);
    const width = itemExtent(SPAN_VW, MAX_COLUMNS);
    firstRow.slice(1).forEach((s, i) => expect(s.x - firstRow[i].x).toBeCloseTo(width * (1 - OVERLAP)));
    for (const s of top) expect(Math.abs(s.x) + width / 2).toBeLessThanOrEqual(SPAN_VW / 2 + 1e-9);
  });

  it("centres a short last row and paints upper rows over lower ones", () => {
    const top = bandLayout(14).filter((_, i) => i % 2 === 0);
    const { columns } = bandGrid(top.length);
    const last = top.slice(columns);
    expect(last.reduce((sum, s) => sum + s.x, 0) / last.length).toBeCloseTo(0);
    expect(top[0].layer).toBeGreaterThan(last[0].layer);
  });

  it("is empty without photos", () => {
    expect(bandLayout(0)).toEqual([]);
  });
});

describe("memoryLayout with bands", () => {
  it("puts the photos and the together photo on band spots that rise straight up", () => {
    const { slots, together } = memoryLayout(5, COMPACT_FINALE);
    const bands = bandLayout(6);
    [...slots, together].forEach((slot, i) => {
      expect(slot.phone.x).toBe(bands[i].x);
      expect(slot.band).toEqual({ top: bands[i].top, layer: bands[i].layer });
      expect(slot.width).toBe(bands[i].width);
      expect(slot.drift).toBe(0);
      expect(slot.spin).toBe(0);
    });
  });

  it("leaves the wide ring untouched", () => {
    expect(memoryLayout(5, WIDE_FINALE).slots.every((s) => s.band === undefined)).toBe(true);
    expect(memoryLayout(5, WIDE_FINALE).slots.map((s) => s.wide)).toEqual(memoryLayout(5, COMPACT_FINALE).slots.map((s) => s.wide));
  });
});
