import { describe, expect, it } from "vitest";
import { IMAGE_FOCI, focusPosition } from "@/lib/graduation/image-focus";

describe("focusPosition", () => {
  it("maps every grid position to an object-position, row by row", () => {
    expect(IMAGE_FOCI.map((f) => focusPosition(f))).toEqual([
      "0% 0%", "50% 0%", "100% 0%",
      "0% 50%", "50% 50%", "100% 50%",
      "0% 100%", "50% 100%", "100% 100%",
    ]);
  });
  it("centres when unset", () => {
    expect(focusPosition()).toBe("50% 50%");
  });
});
