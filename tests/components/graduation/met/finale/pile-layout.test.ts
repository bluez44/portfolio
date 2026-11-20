import { describe, expect, it } from "vitest";
import { ARRIVE_AT, TOGETHER_PHOTO } from "@/components/graduation/met/finale/constants";
import {
  EDGE_PX,
  HEADER_PX,
  MAX_COVER,
  NOTE_REACH_BOTTOM_PX,
  NOTE_REACH_TOP_PX,
  coverage,
  pileLayout,
  type PileInput,
  type Rect,
} from "@/components/graduation/met/finale/pile-layout";

/** A phone viewport with the grown note pinned at `ARRIVE_AT` and the together photo on its top right. */
function phone(viewportW: number, viewportH: number, count: number, noteH = viewportH * 0.3): PileInput {
  const noteW = viewportW - 32;
  const togetherW = Math.min(0.42 * viewportW, 0.3 * viewportH);
  return {
    count,
    viewportW,
    viewportH,
    chrome: 18,
    note: { x: 16, y: ARRIVE_AT * viewportH, w: noteW, h: noteH },
    obstacle: {
      x: viewportW * (0.5 + TOGETHER_PHOTO.phone.x / 100) - togetherW / 2,
      y: TOGETHER_PHOTO.phone.rest * viewportH,
      w: togetherW,
      h: togetherW * 1.25 + 30,
    },
  };
}

const VIEWPORTS: [number, number][] = [
  [360, 640],
  [390, 780],
  [390, 844],
  [430, 932],
];

describe("pileLayout", () => {
  it.each(VIEWPORTS)("keeps every cover within MAX_COVER at %ix%i", (w, h) => {
    for (const count of [4, 9, 16]) {
      const input = phone(w, h, count);
      const rects = pileLayout(input);
      expect(rects).toHaveLength(count);
      rects.forEach((a, i) => {
        for (const b of rects.slice(i + 1)) expect(coverage(a, b)).toBeLessThanOrEqual(MAX_COVER + 1e-9);
        expect(coverage(a, input.obstacle!)).toBeLessThanOrEqual(MAX_COVER + 1e-9);
      });
    }
  });

  it.each(VIEWPORTS)("stays on screen, below the header and clear of the note's text at %ix%i", (w, h) => {
    const input = phone(w, h, 16);
    const text: Rect = {
      x: input.note.x,
      y: input.note.y + NOTE_REACH_TOP_PX,
      w: input.note.w,
      h: input.note.h - NOTE_REACH_TOP_PX - NOTE_REACH_BOTTOM_PX,
    };
    for (const r of pileLayout(input)) {
      expect(r.x).toBeGreaterThanOrEqual(EDGE_PX);
      expect(r.x + r.w).toBeLessThanOrEqual(w - EDGE_PX);
      expect(r.y).toBeGreaterThanOrEqual(HEADER_PX + EDGE_PX);
      expect(r.y + r.h).toBeLessThanOrEqual(h - EDGE_PX);
      expect(coverage(r, text)).toBe(0);
    }
  });

  it("puts photos both above and below the note in each group of four", () => {
    const input = phone(390, 780, 16);
    const rects = pileLayout(input);
    for (let g = 0; g < 16; g += 4) {
      const group = rects.slice(g, g + 4);
      expect(group.some((r) => r.y < input.note.y)).toBe(true);
      expect(group.some((r) => r.y > input.note.y)).toBe(true);
    }
  });

  it("follows a taller note", () => {
    const input = phone(390, 780, 16, 300);
    for (const r of pileLayout(input).filter((r) => r.y > input.note.y)) {
      expect(r.y).toBeGreaterThanOrEqual(input.note.y + input.note.h - NOTE_REACH_BOTTOM_PX);
    }
  });

  it("uses larger photos than the old rows", () => {
    expect(pileLayout(phone(390, 780, 16))[0].w).toBeGreaterThanOrEqual(80);
  });

  it("is empty without photos", () => {
    expect(pileLayout(phone(390, 780, 0))).toEqual([]);
  });
});
