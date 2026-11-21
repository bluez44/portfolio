"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import type { RisoColor } from "@/lib/graduation/event";
import { useCopy } from "../../i18n/lang-context";
import { RisoDialog } from "../../shared/riso-dialog";
import { Tape } from "../../shared/tape";

type PrintProps = { label: string; image: string; alt: string; color: RisoColor; rot: number; overlay?: ReactNode; children: ReactNode };

/**
 * Desktop: one photo opened in full as a polaroid like the finale's together photo. The photo keeps
 * its own aspect ratio (nothing is cropped) and sets the print's width; `overlay` sits over the
 * photo, `children` on the paper chin.
 */
function PrintDialog({ label, image, alt, color, rot, overlay, children, onClose }: PrintProps & { onClose: () => void }) {
  const { met: t } = useCopy();
  return (
    <RisoDialog label={label} closeLabel={t.carousel.close} onClose={onClose}>
      <figure
        className="relative m-0 mx-auto flex w-min min-w-80 flex-col rounded-[6px] border-[1.5px] border-ink bg-paper p-3"
        style={{ boxShadow: `8px 8px 0 var(--${color})`, rotate: `${rot}deg` }}
      >
        <Tape color={color} width={96} height={24} rotate={-3} className="-top-3.5 z-1" />
        <div className="relative mx-auto w-fit overflow-hidden rounded-[3px]">
          {/* The original file, uncropped; for a moment it is the one its card already loaded. */}
          <Image src={image} alt={alt} width={0} height={0} unoptimized className="block h-auto max-h-[62svh] w-auto max-w-[min(80vw,960px)]" />
          {overlay}
        </div>
        {children}
      </figure>
    </RisoDialog>
  );
}

/** A moment card in full: its year and title on a label in the moment's colour over the photo, its story on the chin, which scrolls when long. */
export function MomentDialog({ moment: m, onClose }: { moment: Moment; onClose: () => void }) {
  const label = (
    <div
      className="absolute bottom-0 left-0 m-3 flex max-w-[calc(100%-1.5rem)] flex-col gap-1 rounded-md border-[1.5px] border-ink px-3 py-2 shadow-(--offset-xs)"
      style={{ background: `var(--${m.color})`, color: m.color === "canary" ? "var(--on-canary)" : "var(--paper)" }}
    >
      <span className="font-mono text-[11px] tracking-[0.22em] uppercase">{m.year}</span>
      <h3 className="m-0 font-heading text-[22px] leading-[1.1] font-bold tracking-tight" style={{ fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
        {m.title}
      </h3>
    </div>
  );
  return (
    <PrintDialog label={m.title} image={m.image} alt="" color={m.color} rot={m.rot / 2} overlay={label} onClose={onClose}>
      <figcaption className="max-h-[22svh] overflow-y-auto overscroll-contain px-1 pt-4 pb-1 text-ink">
        <p className="m-0 text-[16px] leading-[1.65] text-pretty">{m.body}</p>
      </figcaption>
    </PrintDialog>
  );
}

/** The finale's together photo in full, captioned on the chin like its polaroid. */
export function TogetherDialog({ image, caption, onClose }: { image: string; caption: string; onClose: () => void }) {
  return (
    <PrintDialog label={caption} image={image} alt={caption} color="canary" rot={-1.5} onClose={onClose}>
      <figcaption className="flex h-12 items-end justify-center px-1 pb-1">
        <span className="truncate font-heading text-[18px] font-medium text-ink-2 italic">{caption}</span>
      </figcaption>
    </PrintDialog>
  );
}
