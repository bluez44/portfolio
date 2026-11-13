import { describe, expect, it } from "vitest";
import { validateSettings } from "@/lib/graduation/content/validate-settings";

const errorsOf = (raw: unknown) => {
  const result = validateSettings(raw);
  return result.ok ? {} : result.fieldErrors;
};

describe("validateSettings", () => {
  it("accepts an empty object", () => {
    expect(validateSettings({})).toEqual({ ok: true, data: {} });
  });
  it("accepts and trims a full payload", () => {
    const result = validateSettings({
      owner: { name: " Vinh " },
      event: { start: "2026-12-01T02:00:00.000Z", end: "2026-12-01T04:00:00.000Z" },
      copy: { vi: { "met.intro": " Xin chào " }, en: { "met.intro": "Hello" } },
      moments: [{ year: "2024", image: "", vi: { title: "A" } }],
    });
    expect(result.ok && result.data.owner?.name).toBe("Vinh");
    expect(result.ok && result.data.copy?.vi?.["met.intro"]).toBe("Xin chào");
  });
  it("reports unknown copy keys per language", () => {
    expect(errorsOf({ copy: { vi: { nope: "x" } } })).toEqual({ "copy.vi.nope": "Trường không tồn tại" });
  });
  it("reports unsupported tokens", () => {
    expect(errorsOf({ copy: { en: { "met.andYou": "And {nam}" } } })["copy.en.met.andYou"]).toContain("{nam}");
  });
  it("requires the end after the start", () => {
    expect(errorsOf({ event: { start: "2026-12-01T04:00:00.000Z", end: "2026-12-01T02:00:00.000Z" } })).toHaveProperty("event.end");
  });
  it("checks a lone end against the default start", () => {
    expect(errorsOf({ event: { end: "2026-01-01T00:00:00.000Z" } })).toHaveProperty("event.end");
  });
  it("reports invalid links", () => {
    expect(errorsOf({ event: { virtualTourUrl: "http://x" } })).toHaveProperty("event.virtualTourUrl");
  });
});
