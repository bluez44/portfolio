import { describe, expect, it } from "vitest";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { icsResponse } from "@/lib/graduation/ics-response";

describe("icsResponse", () => {
  const res = icsResponse(GRADUATION_EVENT, "Võ Lê Quang Vinh", new Date("2026-11-08T00:00:00Z"));

  it("serves an inline calendar file named after the owner", () => {
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
    expect(res.headers.get("content-disposition")).toBe('inline; filename="tot-nghiep-vo-le-quang-vinh.ics"');
  });
  it("contains the event", async () => {
    const body = await res.text();
    expect(body.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(body).toContain("DTSTART:20261128T093000Z");
  });
});
