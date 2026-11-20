import { describe, expect, it } from "vitest";
import { placeBubble } from "@/components/graduation/character/bubble-placement";

const size = { w: 200, h: 40 };

describe("placeBubble", () => {
  it("centres above the head, tail pointing down", () => {
    expect(placeBubble({ x: 500, y: 600 }, size, 1200, { side: "above", gap: 70 })).toEqual({ left: 400, top: 490, tail: "bottom", tailOffset: 0 });
  });

  it("clamps to the screen and shifts the tail back toward the head", () => {
    const box = placeBubble({ x: 1180, y: 600 }, size, 1200, { side: "above", gap: 70 });
    expect(box.left).toBe(1200 - 12 - 200);
    expect(box.tailOffset).toBeGreaterThan(0);
  });

  it("sits beside the head on the side facing the middle of the screen", () => {
    const right = placeBubble({ x: 350, y: 700 }, size, 390, { side: "beside", gap: 22 });
    expect(right).toEqual({ left: 350 - 22 - 200, top: 680, tail: "right", tailOffset: 0 });
    const left = placeBubble({ x: 40, y: 700 }, size, 390, { side: "beside", gap: 22 });
    expect(left).toMatchObject({ left: 62, tail: "left" });
  });
});
