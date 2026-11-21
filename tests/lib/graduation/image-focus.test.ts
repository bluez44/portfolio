import { describe, expect, it } from "vitest";
import { FOCUS_PRESET_NAMES, focusPoint, focusPosition } from "@/lib/graduation/image-focus";

describe("focusPosition", () => {
  it("maps every older grid preset to an object-position, row by row", () => {
    expect(FOCUS_PRESET_NAMES.map((f) => focusPosition(f))).toEqual([
      "0% 0%", "50% 0%", "100% 0%",
      "0% 50%", "50% 50%", "100% 50%",
      "0% 100%", "50% 100%", "100% 100%",
    ]);
  });
  it("uses a free point as is", () => {
    expect(focusPosition({ x: 37, y: 62.5 })).toBe("37% 62.5%");
    expect(focusPoint("top-right")).toEqual({ x: 100, y: 0 });
  });
  it("centres when unset", () => {
    expect(focusPosition()).toBe("50% 50%");
  });
});
