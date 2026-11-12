export type CountdownPhase = "before" | "during" | "after";

export type CountdownResult = {
  phase: CountdownPhase;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function timeLeft(now: Date, startUtc: string, endUtc: string): CountdownResult {
  const nowMs = now.getTime();
  const startMs = new Date(startUtc).getTime();
  const endMs = new Date(endUtc).getTime();

  if (nowMs > endMs) {
    return { phase: "after", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  if (nowMs >= startMs) {
    return { phase: "during", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const diffSec = Math.max(0, Math.floor((startMs - nowMs) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  return { phase: "before", days, hours, minutes, seconds };
}
