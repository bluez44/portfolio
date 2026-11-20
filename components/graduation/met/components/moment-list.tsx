import type { CSSProperties, Ref } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { CARD_VW, GAP_VW } from "../carousel/constants";
import { MomentCard } from "./moment-card";

/**
 * Wide screens: a column of cards alternating left and right along the trail.
 * Phones: a full-bleed sideways carousel that snaps each card to the centre. The side padding
 * lets the first and last card centre too; the vertical padding leaves room for a focused card's
 * lift, tape and shadow, which the scroller would otherwise clip.
 */
const PHONE =
  "max-[759px]:-mx-6 max-[759px]:flex-row max-[759px]:items-center max-[759px]:gap-(--gap) max-[759px]:overflow-x-auto max-[759px]:overscroll-x-contain max-[759px]:snap-x max-[759px]:snap-mandatory max-[759px]:px-(--pad) max-[759px]:py-12 max-[759px]:[scrollbar-width:none] max-[759px]:[&::-webkit-scrollbar]:hidden";

const SPACING = { "--gap": `${GAP_VW}vw`, "--pad": `${(100 - CARD_VW) / 2}vw` } as CSSProperties;

type Props = {
  ref?: Ref<HTMLOListElement>;
  moments: Moment[];
  /** Accessible name of the list (the phone carousel). */
  label: string;
  /** Phones: the carousel takes keyboard focus so arrow keys scroll it. */
  focusable: boolean;
};

export function MomentList({ ref, moments, label, focusable }: Props) {
  return (
    <ol
      ref={ref}
      aria-label={label}
      tabIndex={focusable ? 0 : undefined}
      className={`riso-focus m-0 flex list-none flex-col gap-32 p-0 ${PHONE}`}
      style={SPACING}
    >
      {moments.map((m, i) => (
        <MomentCard key={m.n} moment={m} side={i % 2 === 0 ? "left" : "right"} />
      ))}
    </ol>
  );
}
