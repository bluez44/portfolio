import { describe, expect, it } from "vitest";
import { isValidSlug, parseGuestSlug, toSlug } from "@/lib/graduation/slug";

describe("toSlug", () => {
  it("strips Vietnamese diacritics and joins with dashes", () => {
    expect(toSlug("Nguyễn Minh Anh")).toBe("nguyen-minh-anh");
  });
  it("maps đ/Đ to d", () => {
    expect(toSlug("Đặng Đức")).toBe("dang-duc");
  });
  it("collapses punctuation and trims dashes", () => {
    expect(toSlug("  --Anh (Tom)!! ")).toBe("anh-tom");
  });
  it("returns empty string when nothing is slug-able", () => {
    expect(toSlug("🎓 !!!")).toBe("");
  });
  it("caps length at 64 without a trailing dash", () => {
    const slug = toSlug("a ".repeat(60));
    expect(slug.length).toBeLessThanOrEqual(64);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("isValidSlug", () => {
  it.each(["minh-anh", "a", "k22-cs"])("accepts %s", (s) => {
    expect(isValidSlug(s)).toBe(true);
  });
  it.each(["", "Minh", "minh--anh", "-minh", "minh-", "minh anh", "a".repeat(65)])(
    "rejects %j",
    (s) => {
      expect(isValidSlug(s)).toBe(false);
    },
  );
});

describe("parseGuestSlug", () => {
  it("trims and lowercases", () => {
    expect(parseGuestSlug("  Minh-Anh ")).toBe("minh-anh");
  });
  it("returns null for missing, array, or invalid values", () => {
    expect(parseGuestSlug(undefined)).toBeNull();
    expect(parseGuestSlug(["a", "b"])).toBeNull();
    expect(parseGuestSlug("minh anh")).toBeNull();
    expect(parseGuestSlug("nguyễn")).toBeNull();
    expect(parseGuestSlug("a".repeat(65))).toBeNull();
  });
});
