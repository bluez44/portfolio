import Image from "next/image";
import type { CSSProperties } from "react";
import { ARRIVE_AT, MEMORY_PHOTOS } from "../finale/constants";

/**
 * Memory photos that gather around the pinned note, laid out across the full viewport width (the
 * finale timeline shifts the layer to the viewport's left edge and owns each photo's transform:
 * centring on its spot, tilt and the way in).
 */
export function FinaleMemoryPhotos({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  return (
    <div data-memory-layer aria-hidden className="pointer-events-none absolute top-0 left-0 h-0 w-screen">
      {MEMORY_PHOTOS.map((p, i) => (
        <figure
          key={i}
          data-memory-photo
          className="absolute top-(--top-phone) left-[calc(50%+var(--x-phone))] m-0 rounded-[10px] border-[1.5px] border-ink bg-paper p-1.5 opacity-0 shadow-(--offset-sm) min-[760px]:top-(--top-wide) min-[760px]:left-[calc(50%+var(--x-wide))]"
          style={
            {
              "--x-phone": `${p.phone.x}vw`,
              "--x-wide": `${p.wide.x}vw`,
              "--top-phone": `${(p.phone.rest - ARRIVE_AT) * 100}vh`,
              "--top-wide": `${(p.wide.rest - ARRIVE_AT) * 100}vh`,
              width: p.width,
            } as CSSProperties
          }
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-[6px]">
            <Image src={images[i % images.length]} alt="" fill sizes="(min-width: 760px) 320px, 38vw" className="object-cover" />
          </div>
        </figure>
      ))}
    </div>
  );
}
