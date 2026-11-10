import { describe, it, expect } from "vitest";
import { resolveInvitationCopy } from "@/lib/graduation/resolve-invitation-copy";
import { GRADUATION_COPY } from "@/lib/graduation/i18n";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import type { GuestCustomContent } from "@/lib/graduation/types";

describe("resolveInvitationCopy", () => {
  const baseCopy = GRADUATION_COPY.vi;

  it("returns base copy and event when custom is null or empty", () => {
    const { copy, event } = resolveInvitationCopy(baseCopy, GRADUATION_EVENT, null);
    expect(copy.card.greeting).toBe(baseCopy.card.greeting);
    expect(copy.met.moments.length).toBe(baseCopy.met.moments.length);
    expect(event.dateShort).toBe(GRADUATION_EVENT.dateShort);
  });

  it("overrides envelope stage texts and cover image", () => {
    const custom: GuestCustomContent = {
      envelope: {
        cardGreeting: "Kính gửi Thầy Cô,",
        cardBody: "Em trân trọng kính mời Thầy Cô đến chung vui cùng em.",
        coverImage: "https://blob.vercel-storage.com/cover.jpg",
      },
    };

    const { copy } = resolveInvitationCopy(baseCopy, GRADUATION_EVENT, custom);
    expect(copy.card.greeting).toBe("Kính gửi Thầy Cô,");
    expect(copy.card.body).toBe("Em trân trọng kính mời Thầy Cô đến chung vui cùng em.");
    expect(copy.card.coverImage).toBe("https://blob.vercel-storage.com/cover.jpg");
  });

  it("overrides met moments and finale note", () => {
    const custom: GuestCustomContent = {
      met: {
        headingLead: "Những năm tháng,",
        headingAccent: "bên nhau.",
        note: "Cảm ơn bạn vì đã đồng hành cùng tôi suốt 4 năm đại học.",
        moments: [
          {
            year: "2023",
            title: "Chuyến đi Đà Lạt",
            body: "Kỷ niệm không thể nào quên ở hồ Tuyền Lâm.",
            image: "https://blob.vercel-storage.com/dalat.jpg",
            color: "tomato",
          },
        ],
      },
    };

    const { copy } = resolveInvitationCopy(baseCopy, GRADUATION_EVENT, custom);
    expect(copy.met.heading.lead).toBe("Những năm tháng,");
    expect(copy.met.heading.accent).toBe("bên nhau.");
    expect(copy.met.defaultNote).toBe("Cảm ơn bạn vì đã đồng hành cùng tôi suốt 4 năm đại học.");
    expect(copy.met.moments).toHaveLength(1);
    expect(copy.met.moments[0].title).toBe("Chuyến đi Đà Lạt");
    expect(copy.met.moments[0].image).toBe("https://blob.vercel-storage.com/dalat.jpg");
  });

  it("overrides ends section details and special message", () => {
    const custom: GuestCustomContent = {
      ends: {
        dateShort: "20.12",
        timeRange: "14:00 — 16:30",
        venue: "Sân vận động Bách Khoa",
        address: "Cổng 1, 268 Lý Thường Kiệt",
        specialMessage: "Bàn VIP số 3 dành riêng cho gia đình",
        notes: ["Mang theo thư mời", "Chụp ảnh tại backdrop số 1"],
      },
      music: {
        youtubeId: "customSong123",
      },
    };

    const { copy, event } = resolveInvitationCopy(baseCopy, GRADUATION_EVENT, custom);
    expect(copy.ends.day).toContain("20.12");
    expect(copy.ends.venue).toBe("Sân vận động Bách Khoa");
    expect(copy.ends.specialMessage).toBe("Bàn VIP số 3 dành riêng cho gia đình");
    expect(copy.ends.notes).toEqual(["Mang theo thư mời", "Chụp ảnh tại backdrop số 1"]);
    expect(event.musicYoutubeId).toBe("customSong123");
  });
});
