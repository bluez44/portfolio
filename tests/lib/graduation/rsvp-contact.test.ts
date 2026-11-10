import { describe, expect, it } from "vitest";
import { isEmail, isPhone, isPhoneOrEmail } from "@/lib/graduation/rsvp-contact";

describe("rsvp contact", () => {
  it("accepts local and international phone numbers with separators", () => {
    expect(isPhone("0901 234 567")).toBe(true);
    expect(isPhone("+84 (90) 123-4567")).toBe(true);
    expect(isPhone("12345")).toBe(false);
  });
  it("accepts emails", () => {
    expect(isEmail("vinh@example.com")).toBe(true);
    expect(isEmail("vinh@")).toBe(false);
  });
  it("accepts either", () => {
    expect(isPhoneOrEmail("0901234567")).toBe(true);
    expect(isPhoneOrEmail("a@b.co")).toBe(true);
    expect(isPhoneOrEmail("call me")).toBe(false);
  });
});
