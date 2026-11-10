import { describe, it, expect } from "vitest";
import { guestCustomContentSchema } from "@/lib/graduation/guest-custom-schema";

describe("guestCustomContentSchema", () => {
  it("validates empty object", () => {
    const res = guestCustomContentSchema.safeParse({});
    expect(res.success).toBe(true);
  });

  it("validates full custom structure", () => {
    const input = {
      envelope: {
        coverLead: "Ngày",
        coverAccent: "tốt nghiệp.",
        cardGreeting: "Xin chào bạn,",
        cardBody: "Thân mời bạn...",
        coverImage: "https://blob.vercel-storage.com/photo.jpg",
      },
      met: {
        moments: [
          {
            year: "2024",
            title: "Đồ án",
            body: "Bảo vệ đồ án",
            image: "https://blob.vercel-storage.com/moment.jpg",
            color: "jade",
          },
        ],
      },
      ends: {
        specialMessage: "Liên hệ lễ tân khi đến",
        notes: ["Lưu ý 1", "Lưu ý 2"],
      },
      music: {
        youtubeId: "xyz123",
      },
    };

    const res = guestCustomContentSchema.safeParse(input);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.envelope?.cardGreeting).toBe("Xin chào bạn,");
      expect(res.data.met?.moments?.[0].color).toBe("jade");
      expect(res.data.music?.youtubeId).toBe("xyz123");
    }
  });

  it("rejects invalid riso color", () => {
    const input = {
      met: {
        moments: [
          {
            year: "2024",
            title: "Test",
            body: "Test",
            image: "",
            color: "purple", // not a valid RisoColor
          },
        ],
      },
    };

    const res = guestCustomContentSchema.safeParse(input);
    expect(res.success).toBe(false);
  });
});
