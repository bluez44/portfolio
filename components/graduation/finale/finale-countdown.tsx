"use client";

import { useCopy, useGradEvent } from "../i18n/lang-context";
import { useCountdown } from "./use-countdown";

const pad = (n: number) => String(n).padStart(2, "0");

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-13 flex-col items-center rounded-lg border-[1.5px] border-ink bg-paper px-2.5 py-1.5 sm:px-3" style={{ boxShadow: "var(--offset-xs)" }}>
      <span className="font-heading text-2xl leading-none font-bold text-ink tabular-nums sm:text-3xl">{value}</span>
      <span className="text-[9px] tracking-[0.2em] text-ink-3 uppercase sm:text-[10px]">{label}</span>
    </div>
  );
}

const Dot = () => <span className="font-bold text-ink-3">·</span>;

/** Isolated so its per-second tick does not re-render the rest of FinaleSection. */
export function FinaleCountdown() {
  const { finale: t } = useCopy();
  const event = useGradEvent();
  const countdown = useCountdown(event.startUtc, event.endUtc);

  if (!countdown) return null;

  if (countdown.phase === "before") {
    return (
      <div className="flex items-center gap-1.5 font-mono sm:gap-3">
        <Cell value={String(countdown.days)} label={t.countdown.days} />
        <Dot />
        <Cell value={pad(countdown.hours)} label={t.countdown.hours} />
        <Dot />
        <Cell value={pad(countdown.minutes)} label={t.countdown.minutes} />
        <Dot />
        <Cell value={pad(countdown.seconds)} label={t.countdown.seconds} />
      </div>
    );
  }

  if (countdown.phase === "during") {
    return (
      <span
        className="rounded-full border-[1.5px] border-ink bg-canary px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-(--on-canary) uppercase"
        style={{ boxShadow: "var(--offset-xs)" }}
      >
        {t.countdown.during}
      </span>
    );
  }

  return (
    <span
      className="rounded-full border-[1.5px] border-ink bg-paper-2 px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-ink-2 uppercase"
      style={{ boxShadow: "var(--offset-xs)" }}
    >
      {t.countdown.after}
    </span>
  );
}
