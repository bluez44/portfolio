import { describe, expect, it } from "vitest";
import { focusVars } from "@/components/graduation/shared/image-focus-style";

describe("focusVars", () => {
  it("sets the phone and wide anchors separately, centring what is unset", () => {
    expect(focusVars({ phone: "top-left" })).toEqual({ "--focus-phone": "0% 0%", "--focus-wide": "50% 50%" });
    expect(focusVars(undefined)).toEqual({ "--focus-phone": "50% 50%", "--focus-wide": "50% 50%" });
  });
});
