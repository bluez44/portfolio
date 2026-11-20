import { useMemo, type ReactNode } from "react";
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
 * finale timeline shifts the layers to the viewport's left edge and owns each photo's transform:
 * centring on its spot, tilt and the way in). At most `profile.maxMemories` photos are shown,
 * sampled evenly across the timeline.
 * - Ring (wide): photos behind the note, the together photo in its own layer on top of it.
 * - Pile (phones): one layer above the note; later photos lie on top, the together photo above all.
 * With `onOpen` every photo is a button that opens the memory.
 */
type Props = { memories: Moment[]; together?: string; guestName: string; profile: FinaleProfile; onOpen?: (target: MemoryTarget) => void };

const LAYER = "pointer-events-none absolute top-0 left-0 h-0 w-screen lite:filter-none!";
const LAYER_STYLE = { filter: "brightness(var(--memory-brightness))" };

export function FinaleMemoryPhotos({ memories, together, guestName, profile, onOpen }: Props) {
  const { met: t } = useCopy();
  const list = pickMemories(
    memories.map((moment, index) => ({ moment, index })).filter(({ moment }) => moment.image.trim() !== ""),
    profile.maxMemories,
  );
  const layout = useMemo(() => memoryLayout(list.length, profile), [list.length, profile]);
  if (list.length === 0 && !together) return null;
  const pile = profile.layout === "pile";
  const layer = (className: string, children: ReactNode) => (
    <div data-memory-layer aria-hidden={onOpen ? undefined : true} className={`${LAYER} ${className}`} style={LAYER_STYLE}>
      {children}
    </div>
  );

  const photos = list.map(({ moment: m, index }, i) => (
    <MemoryPolaroid
      key={index}
      slot={layout.slots[i]}
      image={m.image}
      focus={m.focus}
      year={pile ? undefined : m.year}
      title={m.title}
      pile={pile}
      onOpen={onOpen && (() => onOpen({ kind: "moment", index }))}
    />
  ));
  const togetherPhoto = together && (
    <MemoryPolaroid
      key="together"
      slot={layout.together}
      image={together}
      title={t.togetherCaption(guestName)}
      together
      onOpen={onOpen && (() => onOpen({ kind: "together" }))}
    >
      <Tape color="canary" width={72} height={22} rotate={38} className="z-10" style={{ top: -8, left: "auto", right: -20, marginLeft: 0 }} />
    </MemoryPolaroid>
  );

  if (pile) return layer("z-20", [...photos, togetherPhoto]);
  return (
    <>
      {list.length > 0 && layer(onOpen ? "z-20" : "z-0", photos)}
      {togetherPhoto && layer("z-20", togetherPhoto)}
    </>
  );
}
