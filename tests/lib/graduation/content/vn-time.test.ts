import { describe, expect, it } from "vitest";
import { fromVnLocalInput, toVnLocalInput, vnParts } from "@/lib/graduation/content/vn-time";

describe("vnParts", () => {
  it("reads the wall clock in Vietnam (UTC+7)", () => {
    expect(vnParts("2026-11-28T09:30:00Z")).toEqual({ year: 2026, month: 10, day: 28, weekday: 6, hours: 16, minutes: 30 });
  });
  it("rolls over to the next day after 17:00 UTC", () => {
    expect(vnParts("2026-12-31T17:15:00Z")).toEqual({ year: 2027, month: 0, day: 1, weekday: 5, hours: 0, minutes: 15 });
  });
});

describe("toVnLocalInput / fromVnLocalInput", () => {
  it("formats an ISO instant for a datetime-local input in Vietnam time", () => {
    expect(toVnLocalInput("2026-11-28T09:30:00Z")).toBe("2026-11-28T16:30");
  });
  it("parses a datetime-local value as Vietnam time", () => {
    expect(fromVnLocalInput("2026-11-28T16:30")).toBe("2026-11-28T09:30:00.000Z");
  });
  it("round-trips", () => {
    expect(fromVnLocalInput(toVnLocalInput("2027-01-01T00:05:00.000Z"))).toBe("2027-01-01T00:05:00.000Z");
  });
  it("rejects malformed values", () => {
    expect(fromVnLocalInput("")).toBeNull();
    expect(fromVnLocalInput("28/11/2026 16:30")).toBeNull();
  });
});
