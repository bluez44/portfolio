import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, GRADUATION_COPY, parseLang } from "@/lib/graduation/i18n";

describe("parseLang", () => {
  it("accepts supported languages", () => {
    expect(parseLang("vi")).toBe("vi");
    expect(parseLang("en")).toBe("en");
  });
  it("falls back to the default for missing or unknown values", () => {
    expect(parseLang(undefined)).toBe(DEFAULT_LANG);
    expect(parseLang("fr")).toBe(DEFAULT_LANG);
  });
});

describe("GRADUATION_COPY", () => {
  it("has the same number of moments in every language", () => {
    expect(GRADUATION_COPY.en.met.moments).toHaveLength(GRADUATION_COPY.vi.met.moments.length);
    expect(GRADUATION_COPY.vi.met.moments.every((m) => m.title && m.body)).toBe(true);
  });
});
