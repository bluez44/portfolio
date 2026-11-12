import { describe, expect, it } from "vitest";
import { besideX, envelopeSideX } from "@/components/graduation/character/choreography/placement";

describe("envelopeSideX", () => {
  it("never exceeds 1", () => {
    expect(envelopeSideX({ viewportW: 400, envelopeW: 344, cardScale: 1.32, halfW: 2, scale: 0.6 })).toBeLessThanOrEqual(1);
  });
});

describe("besideX", () => {
  it("moves further out for wider objects and never exceeds 1", () => {
    const narrow = besideX({ viewportW: 1440, objectW: 400, halfW: 6, scale: 0.85 });
    const wide = besideX({ viewportW: 1440, objectW: 900, halfW: 6, scale: 0.85 });
    expect(wide).toBeGreaterThan(narrow);
    expect(besideX({ viewportW: 390, objectW: 380, halfW: 2, scale: 0.6 })).toBeLessThanOrEqual(1);
  });
});
