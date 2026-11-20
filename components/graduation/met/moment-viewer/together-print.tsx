import { CARD_VW } from "../carousel/constants";
import { PolaroidPrint } from "../components/polaroid-print";
import { CarouselSlide } from "./carousel-slide";

/** The guest's photo with the owner, as the carousel's last slide after every moment. */
export function TogetherPrint({ image, caption }: { image: string; caption: string }) {
  return (
    <CarouselSlide rot={-1.5}>
      <PolaroidPrint image={image} alt={caption} sizes={`${CARD_VW}vw`} imageStyle={{ opacity: "calc(0.55 + var(--a) * 0.45)" }}>
        <figcaption className="flex h-10 items-end justify-center">
          <span className="truncate font-heading text-[15px] font-medium text-ink-2 italic">{caption}</span>
        </figcaption>
      </PolaroidPrint>
    </CarouselSlide>
  );
}
