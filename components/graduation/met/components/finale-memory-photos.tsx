import Image from "next/image";
import { ARRIVE_AT, MEMORY_PHOTO_WIDTH, MEMORY_PHOTOS } from "../finale/constants";

/**
 * Memory photos that gather above the pinned note, laid out across the full viewport width (the
 * finale timeline shifts the layer to the viewport's left edge and raises each photo into place).
 */
export function FinaleMemoryPhotos({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  return (
    <div data-memory-layer aria-hidden className="pointer-events-none absolute top-0 left-0 h-0 w-screen">
      {MEMORY_PHOTOS.map((p, i) => (
        <figure
          key={i}
          data-memory-photo
          className="absolute m-0 rounded-[10px] opacity-0 border-[1.5px] border-ink bg-paper p-1.5 shadow-(--offset-sm)"
          style={{ left: `calc(50% + ${p.x}vw)`, translate: "-50% 0", width: MEMORY_PHOTO_WIDTH, rotate: `${p.rot}deg`, top: `${(p.rest - ARRIVE_AT) * 100}vh` }}
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-[6px]">
            <Image src={images[i % images.length]} alt="" fill sizes="(min-width: 760px) 200px, 22vw" className="object-cover" />
          </div>
        </figure>
      ))}
    </div>
  );
}
