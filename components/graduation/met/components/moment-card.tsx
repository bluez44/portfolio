import Image from "next/image";
import type { CSSProperties } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { Tape } from "../../shared/tape";
import { CARD_LIFT, CARD_VW, TEXT_LIFT } from "../carousel/constants";
import { PHOTO_QUALITY } from "../photo-quality";

/** Extra scale a card gains when the badge reaches it (wide screens). */
const LIFT = 0.07;

export type MomentCardVariant = "trail" | "carousel";

/**
 * In the carousel (see moment-list) fixed-width cards snap to the centre, where the focused card
 * lifts by `CARD_LIFT` and its text grows to 1 + `TEXT_LIFT`. The text is laid out at
 * 1 / (1 + TEXT_LIFT) of the card's width and scaled from its bottom-left corner, so at full focus
 * it fills the card without reflowing anything.
 */
const VARIANT: Record<MomentCardVariant, { size: CSSProperties; card: string; text: string }> = {
  trail: {
    size: { "--lift": LIFT } as CSSProperties,
    card: "min-h-140 w-[84%]",
    text: "",
  },
  carousel: {
    size: {
      "--lift": CARD_LIFT,
      "--card-w": `${CARD_VW}vw`,
      "--text-scale": `calc(1 + var(--a) * ${TEXT_LIFT})`,
      "--text-w": `calc(100% / ${1 + TEXT_LIFT})`,
    } as CSSProperties,
    card: "min-h-[min(35rem,62svh)] w-(--card-w) shrink-0 snap-center",
    text: "w-(--text-w) origin-bottom-left [scale:var(--text-scale)]",
  },
};

/**
 * `--a` (0..1) is driven by the BK badge's distance along the trail (see use-moment-trail) or by
 * the card's distance from the carousel's centre (see use-moment-carousel): 0 = idle (blurred,
 * veiled photo), 1 = focused (sharp photo, card lifted and straightened).
 */
export function MomentCard({ moment: m, side, variant }: { moment: Moment; side: "left" | "right"; variant: MomentCardVariant }) {
  const v = VARIANT[variant];
  return (
    <li
      data-moment
      data-side={side}
      className={`relative flex flex-col justify-end rounded-[14px] border-[1.5px] border-ink bg-paper ${variant === "trail" ? (side === "left" ? "self-start" : "self-end") : ""} ${v.card}`}
      style={{
        ...v.size,
        "--a": 0,
        boxShadow: `calc(5px + var(--a) * 4px) calc(5px + var(--a) * 4px) 0 var(--${m.color})`,
        transform: `rotate(calc(${m.rot}deg * (1 - var(--a)))) scale(calc(1 + var(--a) * var(--lift)))`,
      } as CSSProperties}
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[13px]">
        <div className="absolute -inset-3 lite:filter-none!" style={{ filter: "blur(calc((1 - var(--a)) * 7px)) saturate(calc(0.35 + var(--a) * 0.65))" }}>
          <Image src={m.image} alt="" fill sizes={variant === "carousel" ? `${CARD_VW}vw` : "400px"} className="object-cover" quality={PHOTO_QUALITY} />
        </div>
        <div className="absolute inset-0 bg-paper" style={{ opacity: "calc((1 - var(--a)) * 0.55)" }} />
        <div className="absolute inset-x-0 bottom-0 h-[72%]" style={{ background: "linear-gradient(to bottom, transparent, var(--paper) )" }} />
      </div>
      <Tape color={m.color} width={84} height={22} rotate={-4} className="-top-3 z-1" />
      <div className={`relative flex flex-col gap-2.5 px-5.5 pt-6.5 pb-5.5 ${v.text}`}>
        <span className="font-mono text-[11px] tracking-[0.24em] uppercase" style={{ color: `var(--${m.color})` }}>
          {m.year}
        </span>
        <h3 className="m-0 font-heading text-2xl leading-[1.05] font-bold tracking-tight" style={{ fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
          {m.title}
        </h3>
        <p className="m-0 text-[15px] leading-[1.6] text-pretty text-ink-2">{m.body}</p>
      </div>
    </li>
  );
}
