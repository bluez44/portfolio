import type { CalendarTarget } from "@/lib/graduation/calendar";

export type PlatformInfo = { userAgent: string; userAgentData?: { platform: string } };

// iPadOS reports itself as a Mac, which lands on Apple Calendar either way.
const APPLE_PLATFORM = /iphone|ipad|ipod|ios|mac/i;

export function calendarTargetFor({ userAgent, userAgentData }: PlatformInfo): CalendarTarget {
  return APPLE_PLATFORM.test(userAgentData?.platform || userAgent) ? "apple" : "google";
}
