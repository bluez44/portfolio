import { useMemo } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { useCopy } from "../../i18n/lang-context";
import { Tape } from "../../shared/tape";
import { memoryLayout } from "../finale/memory-layout";
import { pickMemories } from "../finale/pick-memories";
import type { FinaleProfile } from "../finale/profile";
import type { MemoryTarget } from "../moment-viewer/memory-viewer";
import { MemoryPolaroid } from "./memory-polaroid";

/**
 * Memory photos that gather around the pinned note, laid out across the full viewport width (the
 * finale timeline shifts the layer to the viewport's left edge and owns each photo's transform:
 * centring on its spot, tilt and the way in). The together photo comes last so it paints on top.
 * At most `profile.maxMemories` photos are shown, sampled evenly across the timeline.
 * With `onOpen` (phones) every photo is a button above the note that opens the memory.
 */
type Props = { memories: Moment[]; together?: string; guestName: string; profile: FinaleProfile; onOpen?: (target: MemoryTarget) => void };

const LAYER = "pointer-events-none absolute top-0 left-0 h-0 w-screen lite:filter-none!";

export function FinaleMemoryPhotos({ memories, together, guestName, profile, onOpen }: Props) {
  const { met: t } = useCopy();
  const list = pickMemories(
    memories.map((moment, index) => ({ moment, index })).filter(({ moment }) => moment.image.trim() !== ""),
    profile.maxMemories,
  );
  const layout = useMemo(() => memoryLayout(list.length, profile), [list.length, profile]);
  if (list.length === 0 && !together) return null;
  const interactive = Boolean(onOpen);
  const small = profile.layout === "bands";
  const layerProps = { "data-memory-layer": "", "aria-hidden": interactive ? undefined : true, style: { filter: "brightness(var(--memory-brightness))" } };
  return (
    <>
      {/* Behind the finale card (z-0 < card z-10), or above it while the photos are tappable */}
      {list.length > 0 && (
        <div {...layerProps} className={`${LAYER} ${interactive ? "z-20" : "z-0"}`}>
          {list.map(({ moment: m, index }, i) => (
            <MemoryPolaroid
              key={index}
              slot={layout.slots[i]}
              image={m.image}
              caption={`${m.year} · ${m.title}`}
              small={small}
              onOpen={onOpen && (() => onOpen({ kind: "moment", index }))}
            />
          ))}
        </div>
      )}
      {/* The together photo always sits on top of the finale card (z-20 > card z-10) */}
      {together && (
        <div {...layerProps} className={`${LAYER} z-20`}>
          <MemoryPolaroid
            slot={layout.together}
            image={together}
            caption={t.togetherCaption(guestName)}
            together
            small={small}
            onOpen={onOpen && (() => onOpen({ kind: "together" }))}
          >
            <Tape color="canary" width={small ? 40 : 72} height={small ? 14 : 22} rotate={38} className="z-10" style={{ top: -8, left: "auto", right: -20, marginLeft: 0 }} />
          </MemoryPolaroid>
        </div>
      )}
    </>
  );
}
