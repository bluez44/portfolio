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

describe("parseRsvpInput", () => {
  it("accepts an attending answer and blanks an empty wish", () => {
    expect(parseRsvpInput({ slug: "minh-anh", status: "yes", contact: " 0901 234 567 ", wish: " " })).toEqual({
      ok: true,
      slug: "minh-anh",
      answer: { status: "yes", contact: "0901 234 567", wish: null },
    });
  });
  it("accepts a declining answer with a wish", () => {
    expect(parseRsvpInput({ slug: "minh-anh", status: "no", reason: "Đi công tác", wish: "Chúc mừng!" })).toEqual({
      ok: true,
      slug: "minh-anh",
      answer: { status: "no", reason: "Đi công tác", wish: "Chúc mừng!" },
    });
  });
  it("reports missing or invalid fields by name", () => {
    expect(parseRsvpInput({ slug: "minh-anh", status: "yes", contact: "" })).toEqual({ ok: false, fieldErrors: { contact: "required" } });
    expect(parseRsvpInput({ slug: "minh-anh", status: "yes", contact: "hello" })).toEqual({ ok: false, fieldErrors: { contact: "invalid_contact" } });
    expect(parseRsvpInput({ slug: "minh-anh", status: "no", reason: " ", wish: "x".repeat(501) })).toEqual({
      ok: false,
      fieldErrors: { reason: "required", wish: "too_long" },
    });
  });
  it("rejects other statuses and invalid slugs without field errors", () => {
    expect(parseRsvpInput({ slug: "minh-anh", status: "maybe" })).toEqual({ ok: false, fieldErrors: {} });
    expect(parseRsvpInput({ slug: "Minh Anh", status: "no", reason: "x" })).toEqual({ ok: false, fieldErrors: {} });
  });
});
