import type { Moment } from "@/lib/graduation/i18n";
import { FOCUS_CLASS, focusVars } from "../../shared/image-focus-style";
import { CARD_VW, TEXT_LIFT } from "../carousel/constants";
import { PolaroidPrint } from "../components/polaroid-print";
import { CarouselSlide } from "./carousel-slide";

/** Font size (px) at rest, growing to 1 + `TEXT_LIFT` times as the card is focused. */
const grow = (px: number) => `calc(${px}px * (1 + var(--a) * ${TEXT_LIFT}))`;

/**
 * One moment in the viewer carousel, as a polaroid like the enlarged together photo: its year and
 * title on a label in the moment's colour over the photo, its story on the paper chin, which
 * scrolls when the story is long. Focused, the photo sharpens and the text grows.
 */
export function MomentPrint({ moment: m }: { moment: Moment }) {
  const label = (
    <div
      className="absolute bottom-0 left-0 m-2 flex max-w-[calc(100%-4rem)] flex-col gap-0.5 rounded-md border-[1.5px] border-ink px-2.5 py-1.5 shadow-(--offset-xs)"
      style={{ background: `var(--${m.color})`, color: m.color === "canary" ? "var(--on-canary)" : "var(--paper)" }}
    >
      <span className="font-mono tracking-[0.22em] uppercase" style={{ fontSize: grow(9) }}>
        {m.year}
      </span>
      <h3 className="m-0 font-heading leading-[1.1] font-bold tracking-tight" style={{ fontSize: grow(14), fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
        {m.title}
      </h3>
    </div>
  );
  return (
    <CarouselSlide rot={m.rot}>
      <PolaroidPrint
        image={m.image}
        alt=""
        sizes={`${CARD_VW}vw`}
        className="max-h-[70svh]"
        style={{ boxShadow: `calc(4px + var(--a) * 4px) calc(4px + var(--a) * 4px) 0 var(--${m.color})` }}
        imageClassName={FOCUS_CLASS}
        imageStyle={{ ...focusVars(m.focus), opacity: "calc(0.55 + var(--a) * 0.45)" }}
        overlay={label}
      >
        <figcaption className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pt-3 pb-1 text-ink">
          <p className="m-0 leading-[1.55] text-pretty" style={{ fontSize: grow(12) }}>
            {m.body}
          </p>
        </figcaption>
      </PolaroidPrint>
    </CarouselSlide>
  );
}
