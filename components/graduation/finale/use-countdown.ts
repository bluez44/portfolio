"use client";

import { useMemo, useSyncExternalStore } from "react";
import { timeLeft, type CountdownResult } from "./countdown";

const subscribe = (tick: () => void) => {
  const id = window.setInterval(tick, 1000);
  return () => window.clearInterval(id);
};
const clientSecond = () => Math.floor(Date.now() / 1000);
// The server's clock would disagree with the visitor's at hydration, so nothing is shown until the client takes over.
const serverSecond = () => null;

/** Live countdown to the ceremony, ticking every second; `null` until hydrated. */
export function useCountdown(startUtc: string, endUtc: string): CountdownResult | null {
  const second = useSyncExternalStore(subscribe, clientSecond, serverSecond);
  return useMemo(() => (second == null ? null : timeLeft(new Date(second * 1000), startUtc, endUtc)), [second, startUtc, endUtc]);
}
