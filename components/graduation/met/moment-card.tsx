import type { Moment } from "@/lib/graduation/event";
import { Tape } from "../shared/tape";

export function MomentCard({ moment: m }: { moment: Moment }) {
  return (
    <article
      className="relative flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-ink bg-paper px-[22px] pt-[26px] pb-[22px]"
      style={{ boxShadow: `5px 5px 0 var(--${m.color})`, transform: `rotate(${m.rot}deg)` }}
    >
      <Tape color={m.color} width={84} height={22} rotate={-4} className="-top-3" />
      <span className="font-mono text-[11px] tracking-[0.24em] uppercase" style={{ color: `var(--${m.color})` }}>
        {m.year} · {m.n}
      </span>
      <h3 className="m-0 font-heading text-2xl leading-[1.05] font-bold tracking-[-0.025em]" style={{ fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
        {m.vi}
      </h3>
      <span className="text-[13px] text-ink-3 italic">{m.en}</span>
      <p className="m-0 text-[15px] leading-[1.6] text-pretty text-ink-2">{m.body}</p>
    </article>
  );
}
