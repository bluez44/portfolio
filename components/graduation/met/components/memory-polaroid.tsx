import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ARRIVE_AT, type MemorySlot } from "../finale/constants";

/** One memory photo as a polaroid: thin border on three sides, a deeper chin carrying the caption. */
export function MemoryPolaroid({ slot, image, caption, children }: { slot: MemorySlot; image: string; caption: string; children?: ReactNode }) {
  return (
    <figure
      data-memory-photo
      className="absolute top-(--top-phone) left-[calc(50%+var(--x-phone))] m-0 rounded-[4px] border-[1.5px] border-ink bg-paper p-1.5 pb-6 opacity-0 shadow-(--offset-sm) min-[760px]:top-(--top-wide) min-[760px]:left-[calc(50%+var(--x-wide))] min-[760px]:pb-8"
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
        <Image src={image} alt="" fill sizes="(min-width: 760px) 320px, 38vw" className="object-cover" />
      </div>
      <figcaption className="absolute inset-x-2 bottom-0 flex h-6 items-center justify-center min-[760px]:h-8">
        <span className="truncate font-heading text-[10.5px] text-ink-2 italic min-[760px]:text-[12.5px]">{caption}</span>
      </figcaption>
    </figure>
  );
}
