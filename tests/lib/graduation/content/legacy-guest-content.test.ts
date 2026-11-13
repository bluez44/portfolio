import { describe, expect, it } from "vitest";
import { convertLegacyGuestContent, isLegacyGuestContent } from "@/lib/graduation/content/legacy-guest-content";

describe("isLegacyGuestContent", () => {
  it("detects the old section-shaped content", () => {
    expect(isLegacyGuestContent({ envelope: {} })).toBe(true);
    expect(isLegacyGuestContent({ music: {} })).toBe(false);
    expect(isLegacyGuestContent({ vi: {} })).toBe(false);
  });
});

describe("convertLegacyGuestContent", () => {
  const legacy = {
    envelope: { coverLead: "Ngày", cardGreeting: "Kính gửi,", coverImage: "/c.jpg" },
    met: {
      headingLead: "Những năm,",
      note: "Cảm ơn",
      togetherPhoto: "/us.jpg",
      moments: [{ year: "2023", title: "Đà Lạt", body: "Hồ", image: "/d.jpg", color: "jade" }],
    },
    ends: { venue: "Sân A", address: "Cổng 1", notes: ["A", "B"], dateShort: "20.12", timeRange: "14:00 — 16:00" },
    rsvp: { prompt: "Đến nhé" },
    music: { youtubeId: "hfavqkBrwXI" },
  };
  const result = convertLegacyGuestContent(legacy);

  it("moves texts into the Vietnamese overrides", () => {
    expect(result.vi).toEqual({
      "stage.cover.lead": "Ngày",
      "card.greeting": "Kính gửi,",
      "met.heading.lead": "Những năm,",
      "met.defaultNote": "Cảm ơn",
      "ends.venue": "Sân A",
      "rails.whereValue": "Sân A",
      "ends.address": "Cổng 1",
      "rails.whereSub": "Cổng 1",
      "ends.notes": "A\nB",
      "rsvp.prompt": "Đến nhé",
    });
  });
  it("drops the free-text date and time", () => {
    expect(JSON.stringify(result)).not.toContain("20.12");
    expect(JSON.stringify(result)).not.toContain("14:00");
  });
  it("moves images, moments and music", () => {
    expect(result.images).toEqual({ coverImage: "/c.jpg", togetherPhoto: "/us.jpg" });
    expect(result.moments).toEqual([{ year: "2023", image: "/d.jpg", color: "jade", vi: { title: "Đà Lạt", body: "Hồ" } }]);
    expect(result.music).toEqual({ youtubeId: "hfavqkBrwXI" });
  });
});
