import type { Moment } from "@/lib/graduation/i18n";
import { useCopy } from "../../i18n/lang-context";
import { Tape } from "../../shared/tape";
import { MEMORY_PHOTOS, TOGETHER_PHOTO } from "../finale/constants";
import { MemoryPolaroid } from "./memory-polaroid";

/**
 * Memory photos that gather around the pinned note, laid out across the full viewport width (the
 * finale timeline shifts the layer to the viewport's left edge and owns each photo's transform:
 * centring on its spot, tilt and the way in). The together photo comes last so it paints on top.
 */
export function FinaleMemoryPhotos({ memories, together, guestName }: { memories: Moment[]; together?: string; guestName: string }) {
  const { met: t } = useCopy();
  if (memories.length === 0) return null;
  return (
    <div data-memory-layer aria-hidden className="pointer-events-none absolute top-0 left-0 h-0 w-screen">
      {MEMORY_PHOTOS.map((slot, i) => {
        const m = memories[i % memories.length];
        return <MemoryPolaroid key={i} slot={slot} image={m.image} caption={`${m.year} · ${m.title}`} />;
      })}
      {together && (
        <MemoryPolaroid slot={TOGETHER_PHOTO} image={together} caption={t.togetherCaption(guestName)}>
          <Tape color="canary" width={58} height={18} rotate={38} className="z-10" style={{ top: -6, left: "auto", right: -18, marginLeft: 0 }} />
        </MemoryPolaroid>
      )}
    </div>
  );
}
