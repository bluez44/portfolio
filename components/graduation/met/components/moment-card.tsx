import Image from "next/image";
import type { CSSProperties } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { Tape } from "../../shared/tape";

/**
 * `--a` (0..1) is driven by the BK badge's distance along the trail (see use-moment-trail):
 * 0 = idle (blurred, veiled photo), 1 = badge at the card (sharp photo, card lifted and straightened).
 */
export function MomentCard({ moment: m, side }: { moment: Moment; side: "left" | "right" }) {
  return (
    <li
      data-moment
      data-side={side}
      className={`relative flex min-h-140 w-[84%] flex-col justify-end rounded-[14px] border-[1.5px] border-ink bg-paper  ${side === "left" ? "self-start" : "self-end"}`}
      style={{
        "--a": 0,
        boxShadow: `calc(5px + var(--a) * 4px) calc(5px + var(--a) * 4px) 0 var(--${m.color})`,
        transform: `rotate(calc(${m.rot}deg * (1 - var(--a)))) scale(calc(1 + var(--a) * 0.07))`,
      } as CSSProperties}
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[13px]">
        <div className="absolute -inset-3" style={{ filter: "blur(calc((1 - var(--a)) * 7px)) saturate(calc(0.35 + var(--a) * 0.65))" }}>
          <Image src={m.image} alt="" fill sizes="(min-width: 760px) 400px, 84vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-paper" style={{ opacity: "calc((1 - var(--a)) * 0.55)" }} />
        <div className="absolute inset-x-0 bottom-0 h-[72%]" style={{ background: "linear-gradient(to bottom, transparent, var(--paper) )" }} />
      </div>
      <Tape color={m.color} width={84} height={22} rotate={-4} className="-top-3 z-1" />
      <div className="relative flex flex-col gap-2.5 px-5.5 pt-6.5 pb-5.5">
        <span className="font-mono text-[11px] tracking-[0.24em] uppercase" style={{ color: `var(--${m.color})` }}>
          {m.year} · {m.n}
        </span>
        <h3 className="m-0 font-heading text-2xl leading-[1.05] font-bold tracking-tight" style={{ fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
          {m.title}
        </h3>
        <p className="m-0 text-[15px] leading-[1.6] text-pretty text-ink-2">{m.body}</p>
      </div>
    </li>
  );
}
