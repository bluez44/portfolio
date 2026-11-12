import { describe, expect, it } from "vitest";
import { calendarTargetFor } from "@/lib/browser/calendar-target";

const UA = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36",
  windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36",
};

describe("calendarTargetFor", () => {
  it("sends Apple devices to Apple Calendar", () => {
    for (const userAgent of [UA.iphone, UA.ipad, UA.mac]) expect(calendarTargetFor({ userAgent })).toBe("apple");
  });
  it("sends everyone else to Google Calendar", () => {
    for (const userAgent of [UA.android, UA.windows]) expect(calendarTargetFor({ userAgent })).toBe("google");
  });
  it("prefers the client hints platform over the user agent", () => {
    expect(calendarTargetFor({ userAgent: UA.windows, userAgentData: { platform: "macOS" } })).toBe("apple");
    expect(calendarTargetFor({ userAgent: UA.mac, userAgentData: { platform: "Windows" } })).toBe("google");
  });
});
