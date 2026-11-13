import { describe, expect, it } from "vitest";
import { summarizeGuestContent } from "@/lib/graduation/content/guest-content-summary";

describe("summarizeGuestContent", () => {
  it("is empty for no content", () => {
    expect(summarizeGuestContent(null)).toEqual({ envelope: false, met: false, moments: 0, ends: false, music: false });
  });
  it("flags each tab from either language or its extras", () => {
    expect(
      summarizeGuestContent({
        en: { "card.greeting": "Hi" },
        moments: [{ year: "1", image: "" }],
        event: { start: "2026-12-20T07:00:00.000Z" },
        music: { youtubeId: "abcdefghijk" },
      }),
    ).toEqual({ envelope: true, met: true, moments: 1, ends: true, music: true });
  });
  it("counts the cover image as an envelope customisation", () => {
    expect(summarizeGuestContent({ images: { coverImage: "/c.jpg" } }).envelope).toBe(true);
  });
});
