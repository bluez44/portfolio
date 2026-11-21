"use client";

import Image from "next/image";
import type { Moment } from "@/lib/graduation/i18n";
import { useCopy } from "../../i18n/lang-context";
import { RisoDialog } from "../../shared/riso-dialog";
import { Tape } from "../../shared/tape";

/**
 * Desktop: one moment card opened in full, as a polaroid like the finale's together photo. The
 * photo keeps its own aspect ratio (nothing is cropped) and sets the print's width; its year and
 * title sit on a label in the moment's colour over the photo, its story on the paper chin, which
 * scrolls when the story is long.
 */
export function MomentDialog({ moment: m, onClose }: { moment: Moment; onClose: () => void }) {
  const { met: t } = useCopy();
  return (
    <RisoDialog label={m.title} closeLabel={t.carousel.close} onClose={onClose}>
      <figure
        className="relative m-0 mx-auto flex w-min min-w-80 flex-col rounded-[6px] border-[1.5px] border-ink bg-paper p-3"
        style={{ boxShadow: `8px 8px 0 var(--${m.color})`, rotate: `${m.rot / 2}deg` }}
      >
        <Tape color={m.color} width={96} height={24} rotate={-3} className="-top-3.5 z-1" />
        <div className="relative mx-auto w-fit overflow-hidden rounded-[3px]">
          {/* The same unoptimized file the card already loaded, so the print opens without a refetch. */}
          <Image src={m.image} alt="" width={0} height={0} unoptimized className="block h-auto max-h-[62svh] w-auto max-w-[min(80vw,960px)]" />
          <div
            className="absolute bottom-0 left-0 m-3 flex max-w-[calc(100%-1.5rem)] flex-col gap-1 rounded-md border-[1.5px] border-ink px-3 py-2 shadow-(--offset-xs)"
            style={{ background: `var(--${m.color})`, color: m.color === "canary" ? "var(--on-canary)" : "var(--paper)" }}
          >
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase">{m.year}</span>
            <h3 className="m-0 font-heading text-[22px] leading-[1.1] font-bold tracking-tight" style={{ fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
              {m.title}
            </h3>
          </div>
        </div>
        <figcaption className="max-h-[22svh] overflow-y-auto overscroll-contain px-1 pt-4 pb-1 text-ink">
          <p className="m-0 text-[16px] leading-[1.65] text-pretty">{m.body}</p>
        </figcaption>
      </figure>
    </RisoDialog>
  );
}
