import { describe, expect, it } from "vitest";
import { fromRsvpRow, toRsvpRow } from "@/lib/graduation/rsvp-mapper";

describe("rsvp mapper", () => {
  it("clears the other status's field when writing", () => {
    expect(toRsvpRow({ status: "yes", contact: "a@b.co", wish: null })).toEqual({ status: "yes", contact: "a@b.co", reason: null, wish: null });
    expect(toRsvpRow({ status: "no", reason: "Ốm", wish: "Hi" })).toEqual({ status: "no", contact: null, reason: "Ốm", wish: "Hi" });
  });
  it("round-trips answers", () => {
    const answer = { status: "no" as const, reason: "Ốm", wish: null };
    expect(fromRsvpRow(toRsvpRow(answer))).toEqual(answer);
  });
  it("reads legacy rows without details as empty fields", () => {
    expect(fromRsvpRow({ status: "yes", contact: null, reason: null, wish: null })).toEqual({ status: "yes", contact: "", wish: null });
  });
});
