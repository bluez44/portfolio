import { useMemo } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { useCopy } from "../../i18n/lang-context";
import { Tape } from "../../shared/tape";
import { memoryLayout } from "../finale/memory-layout";
import { MemoryPolaroid } from "./memory-polaroid";

/**
 * Memory photos that gather around the pinned note, laid out across the full viewport width (the
 * finale timeline shifts the layer to the viewport's left edge and owns each photo's transform:
 * centring on its spot, tilt and the way in). The together photo comes last so it paints on top.
 */
export function FinaleMemoryPhotos({ memories, together, guestName }: { memories: Moment[]; together?: string; guestName: string }) {
  const { met: t } = useCopy();
  const list = memories.filter((m) => m.image.trim() !== "");
  const layout = useMemo(() => memoryLayout(list.length), [list.length]);
  if (list.length === 0) return null;
  return (
    // Dimmed on the layer, not in the photos' tweened filter: GSAP can't interpolate var(), and here a theme switch applies at once.
    <div data-memory-layer aria-hidden className="pointer-events-none absolute top-0 left-0 h-0 w-screen" style={{ filter: "brightness(var(--memory-brightness))" }}>
      {list.map((m, i) => (
        <MemoryPolaroid key={i} slot={layout.slots[i]} image={m.image} caption={`${m.year} · ${m.title}`} />
      ))}
      {together && (
        <MemoryPolaroid slot={layout.together} image={together} caption={t.togetherCaption(guestName)} together>
          <Tape color="canary" width={58} height={18} rotate={38} className="z-10" style={{ top: -6, left: "auto", right: -18, marginLeft: 0 }} />
        </MemoryPolaroid>
      )}
    </div>
  );
}
