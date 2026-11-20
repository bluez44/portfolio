import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ARRIVE_AT, type MemorySlot } from "../finale/constants";
import { PHOTO_QUALITY } from "../photo-quality";

/** One memory photo as a polaroid: thin border on three sides, a deeper chin carrying the caption. */
export function MemoryPolaroid({ slot, image, caption, together, children }: { slot: MemorySlot; image: string; caption: string; together?: boolean; children?: ReactNode }) {
  return (
    <figure
      data-memory-photo
      data-memory-together={together || undefined}
      className={`absolute top-(--top-phone) left-[calc(50%+var(--x-phone))] m-0 rounded-[4px] border-[1.5px] border-ink bg-paper p-1.5 pb-6 opacity-0 shadow-(--offset-sm) md:top-(--top-wide) md:left-[calc(50%+var(--x-wide))] md:pb-8 ${
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
      <div className="relative aspect-4/5 overflow-hidden rounded-[2px]">
        <Image
          src={image}
          alt=""
          fill
          sizes={together ? "(min-width: 768px) 420px, 46vw" : "(min-width: 768px) 320px, 38vw"}
          className="object-cover"
          quality={PHOTO_QUALITY}
        />
      </div>
      <figcaption className="absolute inset-x-2 bottom-0 flex h-6 items-center justify-center md:h-8">
        <span
          className={`truncate font-heading text-ink-2 italic ${
            together
              ? "text-[11.5px] md:text-[13.5px] font-medium"
              : "text-[10.5px] md:text-[12.5px]"
          }`}
        >
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}
