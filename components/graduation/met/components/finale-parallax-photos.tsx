import Image from "next/image";
import { PARALLAX_PHOTOS } from "../finale/constants";

/**
 * Photos behind the pinned note, laid out across the full viewport width (the finale timeline
 * shifts the layer to the viewport's left edge and drives each photo's drift).
 */
export function FinaleParallaxPhotos({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  return (
    <div data-parallax-layer aria-hidden className="pointer-events-none absolute top-0 left-0 h-0 w-screen">
      {PARALLAX_PHOTOS.map((p, i) => (
        <figure
          key={i}
          data-parallax-photo
          className="absolute m-0 rounded-[10px] opacity-0 border-[1.5px] border-ink bg-paper p-1.5 shadow-(--offset-sm)"
          style={{ left: `calc(50% + ${p.x}vw)`, translate: "-50% 0", width: p.width, rotate: `${p.rot}deg`, top: `${p.from * 100}vh` }}
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-[6px]">
            <Image src={images[i % images.length]} alt="" fill sizes="(min-width: 760px) 300px, 38vw" className="object-cover" />
          </div>
        </figure>
      ))}
    </div>
  );
}
