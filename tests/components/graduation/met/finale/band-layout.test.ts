import { describe, expect, it } from "vitest";
import { ARRIVE_AT } from "@/components/graduation/met/finale/constants";
import { BAND_COLUMNS, BOTTOM_BAND, TOP_BAND, bandLayout } from "@/components/graduation/met/finale/band-layout";
import { memoryLayout } from "@/components/graduation/met/finale/memory-layout";
import { COMPACT_FINALE, WIDE_FINALE } from "@/components/graduation/met/finale/profile";

describe("bandLayout", () => {
  it("alternates between the band above and the band below the note", () => {
    const spots = bandLayout(6);
    spots.forEach((s, i) => {
      const [from, to] = i % 2 === 0 ? TOP_BAND : BOTTOM_BAND;
      expect(s.rest).toBeGreaterThanOrEqual(from);
      expect(s.rest).toBeLessThan(to);
    });
    expect(TOP_BAND[1]).toBeLessThan(ARRIVE_AT);
  });

  it("gives every photo its own cell", () => {
    const spots = bandLayout(17);
    const cells = new Set(spots.map((s) => `${s.x.toFixed(2)}:${s.rest.toFixed(3)}`));
    expect(cells.size).toBe(17);
  });

  it("keeps rows within the screen width and centres a short last row", () => {
    const spots = bandLayout(2 * (BAND_COLUMNS + 2));
    for (const s of spots) expect(Math.abs(s.x)).toBeLessThan(50);
    const lastTopRow = spots.filter((_, i) => i % 2 === 0).slice(BAND_COLUMNS);
    const mid = lastTopRow.reduce((sum, s) => sum + s.x, 0) / lastTopRow.length;
    expect(mid).toBeCloseTo(0);
  });

  it("is empty without photos", () => {
    expect(bandLayout(0)).toEqual([]);
  });
});

describe("memoryLayout with bands", () => {
  it("places the photos and the together photo on band spots that rise straight up", () => {
    const { slots, together } = memoryLayout(5, COMPACT_FINALE);
    const bands = bandLayout(6);
    [...slots, together].forEach((slot, i) => {
      expect(slot.phone).toEqual({ x: bands[i].x, rest: bands[i].rest });
      expect(slot.width).toBe(bands[i].width);
      expect(slot.drift).toBe(0);
      expect(slot.spin).toBe(0);
    });
  });

  it("leaves the wide ring untouched", () => {
    expect(memoryLayout(5, WIDE_FINALE).slots.map((s) => s.wide)).toEqual(memoryLayout(5, COMPACT_FINALE).slots.map((s) => s.wide));
  });
});
