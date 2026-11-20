"use client";

import Image from "next/image";
import { RisoDialog } from "../../shared/riso-dialog";
import { PHOTO_QUALITY } from "../photo-quality";

type Props = { image: string; caption: string; closeLabel: string; onClose: () => void };

/** One photo enlarged as a polaroid, with its caption on the chin. */
export function PhotoViewer({ image, caption, closeLabel, onClose }: Props) {
  return (
    <RisoDialog label={caption} closeLabel={closeLabel} onClose={onClose}>
      <figure className="relative mx-auto my-0 w-[min(84vw,420px)] rotate-[-1.5deg] rounded-[6px] border-[1.5px] border-ink bg-paper p-2.5 pb-12 shadow-(--offset-sm)">
        <div className="relative aspect-4/5 overflow-hidden rounded-[3px]">
          <Image src={image} alt={caption} fill sizes="(min-width: 760px) 420px, 84vw" className="object-cover" quality={PHOTO_QUALITY} />
        </div>
        <figcaption className="absolute inset-x-3 bottom-0 flex h-12 items-center justify-center">
          <span className="truncate font-heading text-[15px] font-medium text-ink-2 italic">{caption}</span>
        </figcaption>
      </figure>
    </RisoDialog>
  );
}
