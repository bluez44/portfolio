import { describe, expect, it } from "vitest";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { buildIcs } from "@/lib/graduation/ics";

describe("buildIcs", () => {
  const ics = buildIcs(GRADUATION_EVENT, new Date("2026-11-08T00:00:00Z"));
  it("uses UTC start/end and stamp", () => {
    expect(ics).toContain("DTSTART:20261128T093000Z");
    expect(ics).toContain("DTEND:20261128T113000Z");
    expect(ics).toContain("DTSTAMP:20261108T000000Z");
  });
  it("escapes commas in LOCATION and uses CRLF", () => {
    expect(ics).toContain("LOCATION:Hội trường A5\\, ĐH Bách Khoa\\, 268 Lý Thường Kiệt\\, Phường 14\\, Quận 10\\, TP. Hồ Chí Minh");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.endsWith("END:VCALENDAR")).toBe(true);
  });
});
