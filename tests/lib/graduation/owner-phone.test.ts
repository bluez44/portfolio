import { describe, expect, it } from "vitest";
import { readOwnerPhone } from "@/lib/graduation/owner-phone";

describe("readOwnerPhone", () => {
  it("returns the trimmed phone", () => {
    expect(readOwnerPhone({ GRADUATION_OWNER_PHONE: " 0901 234 567 " })).toBe("0901 234 567");
  });
  it("returns null when unset or blank", () => {
    expect(readOwnerPhone({})).toBeNull();
    expect(readOwnerPhone({ GRADUATION_OWNER_PHONE: "  " })).toBeNull();
  });
});
