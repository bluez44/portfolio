import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MomentCarouselCopy } from "@/lib/graduation/i18n/types";
import { RisoIconButton } from "@/components/ui/riso/icon-button";
import type { MomentCarousel } from "../carousel/use-moment-carousel";

const pad = (n: number) => String(n).padStart(2, "0");

/** Previous / next arrows around a "03 / 16" counter and a progress bar for the moment carousel. */
export function MomentCarouselNav({ active, count, go, copy }: MomentCarousel & { copy: MomentCarouselCopy }) {
  if (count <= 1) return null;
  const progress = (active + 1) / count;
  return (
    <div className="flex items-center gap-4 px-6">
      <RisoIconButton label={copy.prev} onClick={() => go(-1)} disabled={active <= 0} className="disabled:cursor-default disabled:opacity-40">
        <ChevronLeft size={18} aria-hidden />
      </RisoIconButton>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
        <span aria-live="polite" className="font-mono text-[11px] tracking-[0.24em] text-ink-2 tabular-nums">
          {pad(active + 1)} / {pad(count)}
        </span>
        <div aria-hidden className="h-1 w-full overflow-hidden rounded-full bg-halftone">
          <div className="h-full origin-left rounded-full bg-tomato transition-transform duration-(--dur-fast)" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      <RisoIconButton label={copy.next} onClick={() => go(1)} disabled={active >= count - 1} className="disabled:cursor-default disabled:opacity-40">
        <ChevronRight size={18} aria-hidden />
      </RisoIconButton>
    </div>
  );
}
