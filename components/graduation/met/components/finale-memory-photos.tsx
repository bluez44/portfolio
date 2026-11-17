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
  if (list.length === 0 && !together) return null;
  return (
    <>
      {/* Background layer: memory photos stay behind the finale card (z-0 < card z-10) */}
      {list.length > 0 && (
        <div
          data-memory-layer
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-0 h-0 w-screen"
          style={{ filter: "brightness(var(--memory-brightness))" }}
        >
          {list.map((m, i) => (
            <MemoryPolaroid key={i} slot={layout.slots[i]} image={m.image} caption={`${m.year} · ${m.title}`} />
          ))}
        </div>
      )}
      {/* Foreground layer: only together photo sits on top of the finale card (z-20 > card z-10) */}
      {together && (
        <div
          data-memory-layer
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-20 h-0 w-screen"
          style={{ filter: "brightness(var(--memory-brightness))" }}
        >
          <MemoryPolaroid slot={layout.together} image={together} caption={t.togetherCaption(guestName)} together>
            <Tape color="canary" width={72} height={22} rotate={38} className="z-10" style={{ top: -8, left: "auto", right: -20, marginLeft: 0 }} />
          </MemoryPolaroid>
        </div>
      )}
    </>
  );
}
