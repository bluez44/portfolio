"use client";

import { useCopy, useGradEvent } from "../i18n/lang-context";

const label = "font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase";

export function TicketWhen() {
  const { ends: t } = useCopy();
  const E = useGradEvent();
  return (
    <div className="flex flex-col gap-3.5 border-b-[1.5px] border-dashed border-ink px-7 py-8 min-[760px]:border-r-[1.5px] min-[760px]:border-b-0">
      <span className={label}>{t.when}</span>
      <span className="font-heading text-[clamp(56px,6vw,84px)] leading-[0.9] font-bold tracking-[-0.04em] text-tomato" style={{ fontVariationSettings: '"wdth" 80, "opsz" 96' }}>
        {E.dateShort}
      </span>
      <span className="font-heading text-lg font-semibold">{t.day}</span>
      <span className="self-start rounded-full border-[1.5px] border-ink bg-canary px-2.5 py-1 font-mono text-xs tracking-[0.14em] text-(--on-canary)">
        {E.timeRange}
      </span>
    </div>
  );
}
