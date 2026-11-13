import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeGuestContent } from "@/lib/graduation/content/normalize-guest-content";

describe("normalizeGuestContent", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty content for nothing", () => {
    expect(normalizeGuestContent(null, null)).toEqual({});
  });
  it("treats the guest note as the Vietnamese personal note", () => {
    expect(normalizeGuestContent(null, " Cảm ơn ")).toEqual({ vi: { "met.defaultNote": "Cảm ơn" } });
  });
  it("ignores a blank guest note", () => {
    expect(normalizeGuestContent({}, "   ")).toEqual({});
  });
  it("lets a custom note win over the guest note", () => {
    const result = normalizeGuestContent({ met: { note: "Riêng" } }, "Ghi chú");
    expect(result.vi?.["met.defaultNote"]).toBe("Riêng");
  });
  it("passes new content through", () => {
    expect(normalizeGuestContent({ en: { "card.greeting": "Hi" } }, null)).toEqual({ en: { "card.greeting": "Hi" } });
  });
  it("falls back to empty content when stored content is invalid", () => {
    expect(normalizeGuestContent({ vi: { "gate.tapBee": "x" } }, null)).toEqual({});
    expect(console.warn).toHaveBeenCalled();
  });
});
