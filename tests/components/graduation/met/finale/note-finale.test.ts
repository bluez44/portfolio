import { describe, expect, it } from "vitest";
import { GROW, HOLD } from "@/components/graduation/met/finale/constants";
import { noteFinaleScroll, noteScaleFor } from "@/components/graduation/met/finale/note-finale";

describe("noteScaleFor", () => {
  it("grows toward 30% of the viewport height, capped at 1.25", () => {
    expect(noteScaleFor({ noteW: 600, noteH: 200, vw: 1440, vh: 900 })).toBeCloseTo(1.25);
    expect(noteScaleFor({ noteW: 600, noteH: 240, vw: 1440, vh: 900 })).toBeCloseTo(1.125);
  });
  it("never shrinks a tall note", () => {
    expect(noteScaleFor({ noteW: 600, noteH: 500, vw: 1440, vh: 900 })).toBe(1);
  });
  it("stays inside the viewport width", () => {
    expect(noteScaleFor({ noteW: 350, noteH: 150, vw: 390, vh: 800 })).toBeCloseTo(358 / 350);
  });
});

describe("noteFinaleScroll", () => {
  it("pins at 40% of the viewport and lasts 2.8 viewports", () => {
    const f = noteFinaleScroll(5000, 1000);
    expect(f.start).toBe(4600);
    expect(f.end).toBe(7400);
    expect(f.grown).toBeCloseTo(4600 + (2800 * GROW) / (GROW + HOLD));
  });
});
