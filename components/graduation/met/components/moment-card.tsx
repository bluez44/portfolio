import Image from "next/image";
import type { CSSProperties } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { FOCUS_CLASS, focusVars } from "../../shared/image-focus-style";
import { Tape } from "../../shared/tape";

/** Extra scale a card gains when the badge reaches it… */
const LIFT = 0.07;
/** …and its text on top of that. The text is laid out at 1 / (1 + TEXT_LIFT) of the card's width and
 * grows from its bottom-left corner, so at full focus it fills the card without reflowing. */
const TEXT_LIFT = 0.2;

/**
 * `--a` (0..1) is driven by the BK badge's distance along the trail (see use-moment-trail):
 * 0 = idle (blurred, veiled photo), 1 = focused (sharp photo, card lifted and straightened, larger
 * text on a backdrop tinted with the moment's colour so it stays readable over the sharp photo).
 * Blur cross-fades a static filtered layer over the sharp image rather than recomputing the filter.
 * The whole card is a button that opens the moment in full.
 */
export function MomentCard({ moment: m, side, onOpen }: { moment: Moment; side: "left" | "right"; onOpen: () => void }) {
  return (
    <li
      data-moment
      data-side={side}
      className={`relative flex min-h-140 w-[84%] flex-col justify-end rounded-[14px] border-[1.5px] border-ink bg-paper ${side === "left" ? "self-start" : "self-end"}`}
      style={{
        "--a": 0,
        boxShadow: `calc(5px + var(--a) * 4px) calc(5px + var(--a) * 4px) 0 var(--${m.color})`,
        transform: `rotate(calc(${m.rot}deg * (1 - var(--a)))) scale(calc(1 + var(--a) * ${LIFT}))`,
      } as CSSProperties}
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[13px]">
        <div className="absolute -inset-3">
          <Image src={m.image} alt="" fill unoptimized className={`object-cover ${FOCUS_CLASS}`} style={focusVars(m.focus)} />
        </div>
        <div
          className="absolute -inset-3 lite:hidden"
          style={{ filter: "blur(7px) saturate(0.35)", opacity: "calc(1 - var(--a))", willChange: "opacity" }}
        >
          <Image src={m.image} alt="" fill unoptimized className={`object-cover ${FOCUS_CLASS}`} style={focusVars(m.focus)} />
        </div>
        <div className="absolute inset-0 bg-paper" style={{ opacity: "calc((1 - var(--a)) * 0.55)" }} />
        <div className="absolute inset-x-0 bottom-0 h-[72%]" style={{ background: "linear-gradient(to bottom, transparent, var(--paper) )" }} />
        <div
          className="absolute inset-x-0 bottom-0 h-[45%]"
          style={{
            opacity: "var(--a)",
            background: `linear-gradient(to bottom, transparent, color-mix(in oklab, var(--paper) 88%, var(--${m.color})) 55%)`,
          }}
        />
      </div>
      <Tape color={m.color} width={84} height={22} rotate={-4} className="-top-3 z-1" />
      <button type="button" aria-label={m.title} onClick={onOpen} className="riso-focus absolute inset-0 z-2 cursor-pointer rounded-[14px] border-0 bg-transparent p-0" />
      <div
        className="relative flex origin-bottom-left flex-col gap-2.5 px-5.5 pt-6.5 pb-5.5"
        style={{ width: `calc(100% / ${1 + TEXT_LIFT})`, scale: `calc(1 + var(--a) * ${TEXT_LIFT})` }}
      >
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
