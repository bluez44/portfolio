import { describe, expect, it } from "vitest";
import { ICS_PATH, calendarLinks } from "@/lib/graduation/calendar";
import { GRADUATION_EVENT } from "@/lib/graduation/event";

describe("calendarLinks", () => {
  const links = calendarLinks(GRADUATION_EVENT);

  it("points Apple Calendar at the served .ics file", () => {
    expect(links.apple).toBe(ICS_PATH);
  });

  it("builds a Google Calendar template with UTC times and the venue", () => {
    const url = new URL(links.google);
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe(GRADUATION_EVENT.title);
    expect(url.searchParams.get("dates")).toBe("20261128T093000Z/20261128T113000Z");
    expect(url.searchParams.get("location")).toBe(`${GRADUATION_EVENT.venue}, ${GRADUATION_EVENT.address}`);
  });

  it("points Apple Calendar at the guest's own .ics file", () => {
    expect(calendarLinks(GRADUATION_EVENT, "a b").apple).toBe(`${ICS_PATH}?g=a%20b`);
  });
});
