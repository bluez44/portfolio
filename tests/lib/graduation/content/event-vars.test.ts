import { describe, expect, it } from "vitest";
import { eventVars } from "@/lib/graduation/content/event-vars";

const times = { startUtc: "2026-11-28T09:30:00Z", endUtc: "2026-11-28T11:30:00Z" };

describe("eventVars", () => {
  it("formats Vietnamese date parts in Vietnam time", () => {
    expect(eventVars(times, "vi")).toEqual({
      date: "28.11",
      dateShort: "28.11",
      year: "2026",
      weekday: "Thứ Bảy",
      weekdayShort: "T7",
      time: "16:30 — 18:30",
    });
  });
  it("formats English date parts", () => {
    expect(eventVars(times, "en")).toEqual({
      date: "Nov 28",
      dateShort: "28.11",
      year: "2026",
      weekday: "Saturday",
      weekdayShort: "Sat",
      time: "16:30 — 18:30",
    });
  });
  it("uses the Vietnam calendar day, not the UTC one", () => {
    const late = { startUtc: "2026-11-28T18:00:00Z", endUtc: "2026-11-28T19:00:00Z" };
    expect(eventVars(late, "vi")).toMatchObject({ date: "29.11", weekday: "Chủ Nhật", time: "01:00 — 02:00" });
  });
});
