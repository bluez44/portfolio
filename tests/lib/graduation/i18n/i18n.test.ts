import { describe, expect, it } from "vitest";
import { resolveGraduationContent } from "@/lib/graduation/content/resolve-content";
import { DEFAULT_LANG, parseLang } from "@/lib/graduation/i18n";

const GRADUATION_COPY = { vi: resolveGraduationContent({ lang: "vi" }).copy, en: resolveGraduationContent({ lang: "en" }).copy };

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
  it("captions the together photo with the guest's name", () => {
    expect(GRADUATION_COPY.vi.met.togetherCaption("Lan")).toBe("Mình & Lan");
    expect(GRADUATION_COPY.en.met.togetherCaption("Lan")).toBe("Us · Lan");
  });
  it("has the letter gate copy in every language", () => {
    for (const copy of Object.values(GRADUATION_COPY)) {
      expect(Object.values(copy.gate).every(Boolean)).toBe(true);
      expect(copy.gate.beeNotice("Vinh")).toContain("Vinh");
    }
  });
  it("renders the event date from the event times", () => {
    expect(GRADUATION_COPY.vi.rails.whenValue).toBe("Thứ Bảy 28.11.2026");
    expect(GRADUATION_COPY.en.rails.whenValue).toBe("Sat · Nov 28, 2026");
    expect(GRADUATION_COPY.vi.ends.day).toBe("Thứ Bảy, 28.11.2026");
    expect(GRADUATION_COPY.en.ends.day).toBe("Saturday, Nov 28, 2026");
    expect(GRADUATION_COPY.vi.narrator.farewell("Lan")).toBe("Hẹn gặp ngày 28.11.");
  });
  it("renders owner and call templates", () => {
    expect(GRADUATION_COPY.vi.meta.title).toBe("Thiệp mời tốt nghiệp – Võ Lê Quang Vinh");
    expect(GRADUATION_COPY.vi.met.andYou("Lan")).toBe("Và bạn, Lan");
    expect(GRADUATION_COPY.en.wishes.airMail("07")).toBe("Air Mail · Wish Nº 07");
    expect(GRADUATION_COPY.vi.ends.calendar.orOther("Lịch Apple")).toBe("hoặc dùng Lịch Apple");
    expect(GRADUATION_COPY.vi.card.author).toBe("— Vinh (Tom)");
    expect(GRADUATION_COPY.vi.ends.specialMessage).toBeUndefined();
  });
});
