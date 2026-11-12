"use client";

import { useSyncExternalStore } from "react";
import { calendarTargetFor, type PlatformInfo } from "@/lib/browser/calendar-target";
import type { CalendarTarget } from "@/lib/graduation/calendar";

const noop = () => () => {};

export function useCalendarTarget(): CalendarTarget {
  return useSyncExternalStore(
    noop,
    () => calendarTargetFor(navigator as Navigator & PlatformInfo),
    () => "google",
  );
}
