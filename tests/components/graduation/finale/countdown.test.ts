import { describe, expect, it } from "vitest";
import { timeLeft } from "@/components/graduation/finale/countdown";

describe("timeLeft", () => {
  const start = "2026-11-28T16:30:00Z";
  const end = "2026-11-28T18:30:00Z";

  it("calculates days, hours, minutes before start", () => {
    // 2 days, 3 hours, 15 minutes, 30 seconds before start
    const now = new Date("2026-11-26T13:14:30Z");
    const res = timeLeft(now, start, end);
    expect(res.phase).toBe("before");
    expect(res.days).toBe(2);
    expect(res.hours).toBe(3);
    expect(res.minutes).toBe(15);
    expect(res.seconds).toBe(30);
  });

  it("returns phase 'during' when event is underway", () => {
    const now = new Date("2026-11-28T17:00:00Z");
    const res = timeLeft(now, start, end);
    expect(res.phase).toBe("during");
    expect(res.days).toBe(0);
    expect(res.hours).toBe(0);
    expect(res.minutes).toBe(0);
  });

  it("returns phase 'after' when event has finished", () => {
    const now = new Date("2026-11-28T19:00:00Z");
    const res = timeLeft(now, start, end);
    expect(res.phase).toBe("after");
    expect(res.days).toBe(0);
  });

  it("returns 0 at the exact start moment with phase 'during'", () => {
    const now = new Date(start);
    const res = timeLeft(now, start, end);
    expect(res.phase).toBe("during");
  });
});
