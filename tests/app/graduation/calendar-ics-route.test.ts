import { describe, expect, it } from "vitest";
import { GET } from "@/app/graduation/calendar.ics/route";

describe("GET /graduation/calendar.ics", () => {
  it("serves the event as an inline calendar file", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
    expect(res.headers.get("content-disposition")).toBe('inline; filename="tot-nghiep-quang-vinh.ics"');
    const body = await res.text();
    expect(body.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(body).toContain("DTSTART:20261128T093000Z");
  });
});
