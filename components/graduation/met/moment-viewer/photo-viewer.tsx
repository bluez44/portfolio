"use client";

import { RisoDialog } from "../../shared/riso-dialog";
import { PolaroidPrint } from "../components/polaroid-print";

type Props = { image: string; caption: string; closeLabel: string; onClose: () => void };

/** One photo enlarged as a polaroid, with its caption on the chin. */
export function PhotoViewer({ image, caption, closeLabel, onClose }: Props) {
  return (
    <RisoDialog label={caption} closeLabel={closeLabel} onClose={onClose}>
      <PolaroidPrint image={image} alt={caption} sizes="(min-width: 760px) 420px, 84vw" className="mx-auto w-[min(84vw,420px)] rotate-[-1.5deg]">
        <figcaption className="flex h-10 items-end justify-center">
          <span className="truncate font-heading text-[15px] font-medium text-ink-2 italic">{caption}</span>
        </figcaption>
      </PolaroidPrint>
    </RisoDialog>
  );
}
