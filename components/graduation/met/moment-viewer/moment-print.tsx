import type { CSSProperties } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { FOCUS_CLASS, focusVars } from "../../shared/image-focus-style";
import { CARD_LIFT, CARD_VW, TEXT_LIFT } from "../carousel/constants";
import { PolaroidPrint } from "../components/polaroid-print";

/** Font size (px) at rest, growing to 1 + `TEXT_LIFT` times as the card is focused. */
const grow = (px: number) => `calc(${px}px * (1 + var(--a) * ${TEXT_LIFT}))`;

/**
 * One moment in the viewer carousel, as a polaroid like the enlarged together photo: the photo on
 * top, its year, title and story on the paper chin, which scrolls when the story is long.
 * `--a` (0..1, from use-moment-carousel) focuses it: lifted, straightened, sharp photo, larger text.
 */
export function MomentPrint({ moment: m }: { moment: Moment }) {
  return (
    <li
      data-moment
      className="w-(--card-w) shrink-0 snap-center"
      style={
        {
          "--a": 0,
          "--card-w": `${CARD_VW}vw`,
          transform: `rotate(calc(${m.rot}deg * (1 - var(--a)))) scale(calc(1 + var(--a) * ${CARD_LIFT}))`,
        } as CSSProperties
      }
    >
      <PolaroidPrint
        image={m.image}
        alt=""
        sizes={`${CARD_VW}vw`}
        className="max-h-[70svh]"
        style={{ boxShadow: `calc(4px + var(--a) * 4px) calc(4px + var(--a) * 4px) 0 var(--${m.color})` }}
        imageClassName={`${FOCUS_CLASS} lite:filter-none!`}
        imageStyle={{ ...focusVars(m.focus), filter: "blur(calc((1 - var(--a)) * 3px)) saturate(calc(0.5 + var(--a) * 0.5))" }}
      >
        <figcaption className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain px-1 pt-3 pb-1 text-ink">
          <span className="font-mono tracking-[0.22em] uppercase" style={{ color: `var(--${m.color})`, fontSize: grow(10) }}>
            {m.year}
          </span>
          <h3 className="m-0 font-heading leading-[1.1] font-bold tracking-tight" style={{ fontSize: grow(17), fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
            {m.title}
          </h3>
          <p className="m-0 leading-[1.55] text-pretty" style={{ fontSize: grow(13) }}>
            {m.body}
          </p>
        </figcaption>
      </PolaroidPrint>
    </li>
  );
}
