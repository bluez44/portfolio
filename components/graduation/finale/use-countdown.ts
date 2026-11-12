"use client";

import { useEffect, useState } from "react";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { timeLeft, type CountdownResult } from "./countdown";

export function useCountdown(
  startUtc = GRADUATION_EVENT.startUtc,
  endUtc = GRADUATION_EVENT.endUtc,
): CountdownResult {
  const [result, setResult] = useState<CountdownResult>(() => timeLeft(new Date(), startUtc, endUtc));

  useEffect(() => {
    setResult(timeLeft(new Date(), startUtc, endUtc));

    const id = setInterval(() => {
      setResult(timeLeft(new Date(), startUtc, endUtc));
    }, 1000);

    return () => clearInterval(id);
  }, [startUtc, endUtc]);

  return result;
}
