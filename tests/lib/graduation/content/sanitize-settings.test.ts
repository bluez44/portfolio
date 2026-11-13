import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sanitizeSettings } from "@/lib/graduation/content/sanitize-settings";

describe("sanitizeSettings", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an empty object for missing or malformed rows", () => {
    expect(sanitizeSettings(null)).toEqual({});
    expect(sanitizeSettings("oops")).toEqual({});
    expect(sanitizeSettings([1])).toEqual({});
  });
  it("keeps valid fields and drops only the broken ones", () => {
    const result = sanitizeSettings({ event: { start: "2026-12-01T02:00:00.000Z", mapEmbedUrl: "http://bad" } });
    expect(result.event).toEqual({ start: "2026-12-01T02:00:00.000Z" });
  });
  it("drops unknown keys, bad tokens and non-strings in copy", () => {
    const result = sanitizeSettings({ copy: { vi: { "met.intro": "Ok", nope: "x", "met.andYou": "{nam}", "card.body": 3 } } });
    expect(result.copy?.vi).toEqual({ "met.intro": "Ok" });
  });
  it("keeps good moments and drops broken ones", () => {
    const result = sanitizeSettings({ moments: [{ year: "2024", image: "" }, { year: 5 }] });
    expect(result.moments).toEqual([{ year: "2024", image: "" }]);
  });
  it("warns about what it dropped", () => {
    sanitizeSettings({ copy: { en: { nope: "x" } } });
    expect(console.warn).toHaveBeenCalled();
  });
});
