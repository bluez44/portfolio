import { describe, expect, it } from "vitest";
import { guestInputSchema } from "@/lib/graduation/guest-schema";
import { parseRsvpInput } from "@/lib/graduation/rsvp-schema";

describe("guestInputSchema", () => {
  it("trims, treats blank slug as undefined and blank note as null", () => {
    expect(guestInputSchema.parse({ name: "  Minh Anh ", slug: " ", note: "" })).toEqual({
      name: "Minh Anh",
      slug: undefined,
      note: null,
    });
  });
  it("rejects empty name, bad slug, oversize note", () => {
    expect(guestInputSchema.safeParse({ name: " ", slug: "", note: "" }).success).toBe(false);
    expect(guestInputSchema.safeParse({ name: "A", slug: "Bad Slug", note: "" }).success).toBe(false);
    expect(guestInputSchema.safeParse({ name: "A", slug: "", note: "x".repeat(501) }).success).toBe(false);
  });
});

const GUEST_ID = "6e565e95-4579-4c1b-9d0e-2f1a3b4c5d6e";

describe("parseRsvpInput", () => {
  it("accepts an attending answer and blanks an empty wish", () => {
    expect(parseRsvpInput({ guestId: GUEST_ID, status: "yes", contact: " 0901 234 567 ", wish: " " })).toEqual({
      ok: true,
      guestId: GUEST_ID,
      answer: { status: "yes", contact: "0901 234 567", wish: null },
    });
  });
  it("accepts a declining answer with a wish", () => {
    expect(parseRsvpInput({ guestId: GUEST_ID, status: "no", reason: "Đi công tác", wish: "Chúc mừng!" })).toEqual({
      ok: true,
      guestId: GUEST_ID,
      answer: { status: "no", reason: "Đi công tác", wish: "Chúc mừng!" },
    });
  });
  it("reports missing or invalid fields by name", () => {
    expect(parseRsvpInput({ guestId: GUEST_ID, status: "yes", contact: "" })).toEqual({ ok: false, fieldErrors: { contact: "required" } });
    expect(parseRsvpInput({ guestId: GUEST_ID, status: "yes", contact: "hello" })).toEqual({ ok: false, fieldErrors: { contact: "invalid_contact" } });
    expect(parseRsvpInput({ guestId: GUEST_ID, status: "no", reason: " ", wish: "x".repeat(501) })).toEqual({
      ok: false,
      fieldErrors: { reason: "required", wish: "too_long" },
    });
  });
  it("rejects other statuses and invalid guest ids without field errors", () => {
    expect(parseRsvpInput({ guestId: GUEST_ID, status: "maybe" })).toEqual({ ok: false, fieldErrors: {} });
    expect(parseRsvpInput({ guestId: "minh-anh", status: "no", reason: "x" })).toEqual({ ok: false, fieldErrors: {} });
  });
});
