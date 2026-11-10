import { describe, expect, it } from "vitest";
import { cardFocusKeys } from "@/components/graduation/met/trail/card-focus";
import { interpolate } from "@/components/graduation/met/trail/scroll-mapping";

describe("cardFocusKeys", () => {
  // Trigger runs over scroll 1000..3000; viewport 800 tall, so a dock at y meets mid-screen at y - 400.
  const input = { dockTops: [1800, 2600], stops: [600, 900], total: 1200, vh: 800, start: 1000, end: 3000 };

  it("puts the badge on each card when that card reaches mid-screen", () => {
    const keys = cardFocusKeys(input);
    expect(interpolate(keys, (1800 - 400 - 1000) / 2000)).toBeCloseTo(600 / 1200);
    expect(interpolate(keys, (2600 - 400 - 1000) / 2000)).toBeCloseTo(900 / 1200);
  });

  it("runs the first leg faster than scroll when the first card is far along the path", () => {
    const keys = cardFocusKeys(input);
    // Half the path is covered in the first fifth of the scroll.
    expect(interpolate(keys, 0.2)).toBeCloseTo(0.5);
  });

  it("falls back to a straight mapping for an empty range", () => {
    expect(cardFocusKeys({ ...input, end: 1000 })).toEqual([
      { at: 0, value: 0 },
      { at: 1, value: 1 },
    ]);
  });
});
