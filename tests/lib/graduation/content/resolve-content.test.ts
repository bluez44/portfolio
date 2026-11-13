import { describe, expect, it } from "vitest";
import { resolveGraduationContent } from "@/lib/graduation/content/resolve-content";

const GRADUATION_COPY = { vi: resolveGraduationContent({ lang: "vi" }).copy, en: resolveGraduationContent({ lang: "en" }).copy };

describe("resolveGraduationContent", () => {
  it("matches the default copy without settings or guest", () => {
    const { copy, event } = resolveGraduationContent({ lang: "vi" });
    expect(copy.rails.whenValue).toBe(GRADUATION_COPY.vi.rails.whenValue);
    expect(copy.met.moments).toEqual(GRADUATION_COPY.vi.met.moments);
    expect(event.timeRange).toBe("16:30 — 18:30");
  });
  it("re-renders every date template from a guest's own time", () => {
    const { copy, event } = resolveGraduationContent({ lang: "vi", guest: { event: { start: "2026-12-20T07:00:00.000Z" } } });
    expect(copy.rails.whenValue).toBe("Chủ Nhật 20.12.2026");
    expect(copy.rsvp.stamp).toBe("Sẽ đến · 20.12.2026");
    expect(copy.narrator.farewell("Lan")).toBe("Hẹn gặp ngày 20.12.");
    expect(event.dateShort).toBe("20.12");
  });
  it("fills the owner into templates", () => {
    const { copy, owner } = resolveGraduationContent({ lang: "en", settings: { owner: { name: "Lan Anh", initials: "LA" } } });
    expect(copy.envelope.from).toBe("From: Lan Anh");
    expect(copy.marks.signature).toBe("LA · 2026");
    expect(owner.name).toBe("Lan Anh");
  });
  it("never mixes Vietnamese into English", () => {
    const { copy } = resolveGraduationContent({ lang: "en", guest: { vi: { "card.greeting": "Kính gửi," } } });
    expect(copy.card.greeting).toBe(GRADUATION_COPY.en.card.greeting);
  });
  it("passes the cover image into the card copy", () => {
    const { copy } = resolveGraduationContent({ lang: "vi", settings: { images: { coverImage: "/c.jpg" } } });
    expect(copy.card.coverImage).toBe("/c.jpg");
  });
  it("uses the guest's music", () => {
    const { event } = resolveGraduationContent({ lang: "vi", guest: { music: { youtubeId: "abcdefghijk" } } });
    expect(event.musicYoutubeId).toBe("abcdefghijk");
  });
});
