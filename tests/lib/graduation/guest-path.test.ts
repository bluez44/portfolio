import { describe, expect, it } from "vitest";
import { guestPath, guestSegment, parseGuestId } from "@/lib/graduation/guest-path";

const ID = "6e565e95-4579-4c1b-9d0e-2f1a3b4c5d6e";

describe("guestSegment", () => {
  it("prefixes the id with the slug", () => {
    expect(guestSegment({ id: ID, slug: "dai-viet" })).toBe(`dai-viet-${ID}`);
  });

  it("falls back to the bare id without a slug", () => {
    expect(guestSegment({ id: ID, slug: "" })).toBe(ID);
  });

  it("builds the page path", () => {
    expect(guestPath({ id: ID, slug: "dai-viet" })).toBe(`/graduation/dai-viet-${ID}`);
  });
});

describe("parseGuestId", () => {
  it("reads the id after the slug", () => {
    expect(parseGuestId(`dai-viet-${ID}`)).toBe(ID);
  });

  it("accepts a bare id", () => {
    expect(parseGuestId(ID)).toBe(ID);
  });

  it("ignores what the slug says", () => {
    expect(parseGuestId(`someone-else-${ID}`)).toBe(ID);
  });

  it("rejects a bare slug", () => {
    expect(parseGuestId("dai-viet")).toBeNull();
  });

  it("rejects an id glued to the slug without a dash", () => {
    expect(parseGuestId(`dai-viet${ID}`)).toBeNull();
  });
});
