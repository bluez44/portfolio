import { describe, expect, it } from "vitest";
import { IMAGE_FOCI, focusPosition, focusVars } from "@/lib/graduation/image-focus";

describe("focusPosition", () => {
  it("maps every grid position to an object-position", () => {
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

describe("focusVars", () => {
  it("sets the phone and wide anchors separately", () => {
    expect(focusVars({ phone: "top-left" })).toEqual({ "--focus-phone": "0% 0%", "--focus-wide": "50% 50%" });
    expect(focusVars(undefined)).toEqual({ "--focus-phone": "50% 50%", "--focus-wide": "50% 50%" });
  });
});
