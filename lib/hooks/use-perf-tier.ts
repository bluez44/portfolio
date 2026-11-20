"use client";

import { useSyncExternalStore } from "react";
import type { PerfTier } from "@/lib/browser/perf-tier";

const subscribe = () => () => {};
const getServerSnapshot = (): PerfTier => "full";
const getSnapshot = (): PerfTier =>
  document.documentElement.dataset.perf === "lite" ? "lite" : "full";

export function usePerfTier(): PerfTier {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
