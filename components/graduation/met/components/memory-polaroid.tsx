import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ARRIVE_AT, type MemorySlot } from "../finale/constants";
import { PHOTO_QUALITY } from "../photo-quality";

type Props = {
  slot: MemorySlot;
  image: string;
  caption: string;
  together?: boolean;
  /** Phone rows: a small square print without the chin; the caption shows in the memory viewer. */
  small?: boolean;
  onOpen?: () => void;
  children?: ReactNode;
};

/**
 * One memory photo as a polaroid: thin border on three sides, a deeper chin carrying the caption.
 * With `onOpen` the whole polaroid is a button.
 */
export function MemoryPolaroid({ slot, image, caption, together, small, onOpen, children }: Props) {
  return (
    <figure
      data-memory-photo
      data-memory-together={together || undefined}
      className={`absolute top-(--top-phone) left-[calc(50%+var(--x-phone))] m-0 rounded-[4px] border-[1.5px] border-ink bg-paper p-1.5 opacity-0 ${small ? "" : "pb-6"} shadow-(--offset-sm) min-[760px]:top-(--top-wide) min-[760px]:left-[calc(50%+var(--x-wide))] min-[760px]:pb-8 ${
        together ? "z-20" : "z-1"
      }`}
      style={
        {
          "--x-phone": `${slot.phone.x}vw`,
          "--x-wide": `${slot.wide.x}vw`,
          "--top-phone": `${(slot.phone.rest - ARRIVE_AT) * 100}vh`,
          "--top-wide": `${(slot.wide.rest - ARRIVE_AT) * 100}vh`,
          width: slot.width,
        } as CSSProperties
      }
    >
      {children}
      {onOpen && (
        <button type="button" aria-label={caption} onClick={onOpen} className="riso-focus pointer-events-auto absolute inset-0 z-1 cursor-pointer rounded-[4px] border-0 bg-transparent p-0" />
      )}
      <div className={`relative overflow-hidden rounded-[2px] ${small ? "aspect-square" : "aspect-4/5"}`}>
        <Image
          src={image}
          alt=""
          fill
          sizes={small ? "20vw" : together ? "(min-width: 768px) 420px, 46vw" : "(min-width: 768px) 320px, 38vw"}
          className="object-cover"
          quality={PHOTO_QUALITY}
        />
      </div>
      <figcaption hidden={small} className="absolute inset-x-2 bottom-0 flex h-6 items-center justify-center min-[760px]:h-8">
        <span
          className={`truncate font-heading text-ink-2 italic ${
            together
              ? "text-[11.5px] min-[760px]:text-[13.5px] font-medium"
              : "text-[10.5px] min-[760px]:text-[12.5px]"
          }`}
        >
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}
