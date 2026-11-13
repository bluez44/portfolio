import { describe, expect, it } from "vitest";
import { eventVars } from "@/lib/graduation/content/event-vars";
import { resolveEvent, resolveEventTimes } from "@/lib/graduation/content/resolve-event";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { GRADUATION_COPY } from "@/lib/graduation/i18n";

describe("resolveEventTimes", () => {
  it("uses the defaults", () => {
    expect(resolveEventTimes(undefined, undefined)).toEqual({ startUtc: GRADUATION_EVENT.startUtc, endUtc: GRADUATION_EVENT.endUtc });
  });
  it("prefers the guest, then the shared settings, per end", () => {
    const times = resolveEventTimes(
      { start: "2026-12-01T02:00:00.000Z", end: "2026-12-01T05:00:00.000Z" },
      { start: "2026-12-01T03:00:00.000Z" },
    );
    expect(times).toEqual({ startUtc: "2026-12-01T03:00:00.000Z", endUtc: "2026-12-01T05:00:00.000Z" });
  });
  it("gives a lone later start a two-hour slot", () => {
    expect(resolveEventTimes(undefined, { start: "2026-12-20T07:00:00.000Z" })).toEqual({
      startUtc: "2026-12-20T07:00:00.000Z",
      endUtc: "2026-12-20T09:00:00.000Z",
    });
  });
});

describe("resolveEvent", () => {
  const times = { startUtc: "2026-12-20T07:00:00.000Z", endUtc: "2026-12-20T09:00:00.000Z" };
  const event = resolveEvent({ times, vars: eventVars(times, "vi"), copy: GRADUATION_COPY.vi, settings: { virtualTourUrl: "https://tour.example" } });

  it("derives display values from the times", () => {
    expect(event).toMatchObject({ ...times, dateShort: "20.12", timeRange: "14:00 — 16:00", year: "2026" });
  });
  it("takes the title and place from the copy", () => {
    expect(event).toMatchObject({ title: GRADUATION_COPY.vi.meta.eventTitle, venue: GRADUATION_COPY.vi.ends.venue, address: GRADUATION_COPY.vi.ends.address });
  });
  it("layers links and music", () => {
    expect(event.virtualTourUrl).toBe("https://tour.example");
    expect(event.mapEmbedUrl).toBe(GRADUATION_EVENT.mapEmbedUrl);
    expect(resolveEvent({ times, vars: eventVars(times, "vi"), copy: GRADUATION_COPY.vi, musicOverride: "abcdefghijk" }).musicYoutubeId).toBe("abcdefghijk");
  });
});
