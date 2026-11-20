import type { CSSProperties, Ref } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { CARD_VW, GAP_VW } from "../carousel/constants";
import { MomentPrint } from "./moment-print";

/**
 * Full-bleed sideways scroller that snaps each moment to the centre. The side padding lets the
 * first and last centre too; the vertical padding leaves room for a focused print's lift and shadow.
 */
const SPACING = { "--gap": `${GAP_VW}vw`, "--pad": `${(100 - CARD_VW) / 2}vw` } as CSSProperties;

type Props = { ref?: Ref<HTMLOListElement>; moments: Moment[]; label: string };

export function MomentCarouselList({ ref, moments, label }: Props) {
  return (
    <ol
      ref={ref}
      aria-label={label}
      tabIndex={0}
      className="riso-focus m-0 flex list-none snap-x snap-mandatory items-center gap-(--gap) overflow-x-auto overscroll-x-contain px-(--pad) py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={SPACING}
    >
      {moments.map((m) => (
        <MomentPrint key={m.n} moment={m} />
      ))}
    </ol>
  );
}
