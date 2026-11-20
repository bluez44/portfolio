"use client";

import { useRef } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import type { MomentCarouselCopy } from "@/lib/graduation/i18n/types";
import { RisoDialog } from "../../shared/riso-dialog";
import { useMomentCarousel } from "../carousel/use-moment-carousel";
import { MomentCarouselNav } from "../components/moment-carousel-nav";
import { MomentCarouselList } from "./moment-carousel-list";

type Props = { moments: Moment[]; startIndex: number; copy: MomentCarouselCopy; onClose: () => void };

/** Every moment as a full card in a sideways carousel, opened on the memory the guest tapped. */
export function MomentViewer({ moments, startIndex, copy, onClose }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const carousel = useMomentCarousel(listRef, startIndex);
  return (
    <RisoDialog label={copy.label} closeLabel={copy.close} onClose={onClose}>
      <MomentCarouselList ref={listRef} moments={moments} label={copy.label} />
      <div className="mx-4 rounded-2xl border-[1.5px] border-ink bg-paper py-2 shadow-(--offset-sm)">
        <MomentCarouselNav {...carousel} copy={copy} />
      </div>
    </RisoDialog>
  );
}
