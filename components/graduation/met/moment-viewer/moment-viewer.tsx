"use client";

import { useRef } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import type { MomentCarouselCopy } from "@/lib/graduation/i18n/types";
import { RisoDialog } from "../../shared/riso-dialog";
import { useMomentCarousel } from "../carousel/use-moment-carousel";
import { MomentCarouselNav } from "./moment-carousel-nav";
import { MomentCarouselList } from "./moment-carousel-list";
import type { TogetherPhoto } from "./together-print";

type Props = {
  moments: Moment[];
  /** Shown past the last moment. */
  together?: TogetherPhoto;
  /** Slide to open on: a moment's index, or `moments.length` for the together photo. */
  startIndex: number;
  copy: MomentCarouselCopy;
  onClose: () => void;
};

/**
 * Every moment as a full card in a sideways carousel, then the together photo, opened on the memory
 * the guest tapped. The arrows step through the moments only and step aside on the together photo.
 */
export function MomentViewer({ moments, together, startIndex, copy, onClose }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const carousel = useMomentCarousel(listRef, startIndex);
  const onTogether = carousel.active >= moments.length;
  return (
    <RisoDialog label={copy.label} closeLabel={copy.close} onClose={onClose}>
      <MomentCarouselList ref={listRef} moments={moments} together={together} label={copy.label} />
      {/* Hidden rather than removed, so the carousel above keeps its place. */}
      <div className={`mx-4 rounded-2xl border-[1.5px] border-ink bg-paper py-2 shadow-(--offset-sm) ${onTogether ? "invisible" : ""}`}>
        <MomentCarouselNav {...carousel} active={Math.min(carousel.active, moments.length - 1)} count={moments.length} copy={copy} />
      </div>
    </RisoDialog>
  );
}
