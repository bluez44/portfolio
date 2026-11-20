import type { CSSProperties, Ref } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { CARD_VW, GAP_VW } from "../carousel/constants";
import { MomentCard, type MomentCardVariant } from "./moment-card";

/**
 * - trail: a column of cards alternating left and right along the trail (wide screens only; phones
 *   meet the moments in the finale instead).
 * - carousel: a full-bleed sideways scroller that snaps each card to the centre. The side padding
 *   lets the first and last card centre too; the vertical padding leaves room for a focused card's
 *   lift, tape and shadow, which the scroller would otherwise clip.
 */
const LAYOUT: Record<MomentCardVariant, string> = {
  trail: "flex-col gap-32 max-[759px]:hidden",
  carousel:
    "flex-row items-center gap-(--gap) overflow-x-auto overscroll-x-contain snap-x snap-mandatory px-(--pad) py-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
};

const SPACING = { "--gap": `${GAP_VW}vw`, "--pad": `${(100 - CARD_VW) / 2}vw` } as CSSProperties;

type Props = {
  ref?: Ref<HTMLOListElement>;
  moments: Moment[];
  variant: MomentCardVariant;
  /** Accessible name of the carousel. */
  label?: string;
};

export function MomentList({ ref, moments, variant, label }: Props) {
  const carousel = variant === "carousel";
  return (
    <ol
      ref={ref}
      aria-label={label}
      tabIndex={carousel ? 0 : undefined}
      className={`riso-focus m-0 flex list-none p-0 ${LAYOUT[variant]}`}
      style={carousel ? SPACING : undefined}
    >
      {moments.map((m, i) => (
        <MomentCard key={m.n} moment={m} side={i % 2 === 0 ? "left" : "right"} variant={variant} />
      ))}
    </ol>
  );
}
