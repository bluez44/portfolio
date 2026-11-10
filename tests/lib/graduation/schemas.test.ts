import { describe, expect, it } from "vitest";
import { guestInputSchema } from "@/lib/graduation/guest-schema";
import { rsvpInputSchema } from "@/lib/graduation/rsvp-schema";

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

describe("rsvpInputSchema", () => {
  it("accepts yes/no with a valid slug", () => {
    expect(rsvpInputSchema.parse({ slug: "minh-anh", status: "no" })).toEqual({
      slug: "minh-anh",
      status: "no",
    });
  });
  it("rejects other statuses and invalid slugs", () => {
    expect(rsvpInputSchema.safeParse({ slug: "minh-anh", status: "maybe" }).success).toBe(false);
    expect(rsvpInputSchema.safeParse({ slug: "Minh Anh", status: "yes" }).success).toBe(false);
  });
});
