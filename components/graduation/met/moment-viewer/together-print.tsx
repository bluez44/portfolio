import type { MomentFocus } from "@/lib/graduation/image-focus";
import { FOCUS_CLASS, focusVars } from "../../shared/image-focus-style";
import { CARD_VW } from "../carousel/constants";
import { PolaroidPrint } from "../components/polaroid-print";
import { CarouselSlide } from "./carousel-slide";

/** The together photo as the viewer and finale know it: the photo, its caption and its crop anchor. */
export type TogetherPhoto = { image: string; caption: string; focus?: MomentFocus };

/** The guest's photo with the owner, as the carousel's last slide after every moment. */
export function TogetherPrint({ image, caption, focus }: TogetherPhoto) {
  return (
    <CarouselSlide rot={-1.5}>
      <PolaroidPrint
        image={image}
        alt={caption}
        sizes={`${CARD_VW}vw`}
        imageClassName={FOCUS_CLASS}
        imageStyle={{ ...focusVars(focus), opacity: "calc(0.55 + var(--a) * 0.45)" }}
      >
        <figcaption className="flex h-10 items-end justify-center">
          <span className="truncate font-heading text-[15px] font-medium text-ink-2 italic">{caption}</span>
        </figcaption>
      </PolaroidPrint>
    </CarouselSlide>
  );
}
