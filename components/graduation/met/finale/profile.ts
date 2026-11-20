/**
 * How long the personal-note finale stays pinned, and how the memory photos gather around it.
 * Phones show every photo in a loose pile above and below the note, arriving a few at a time; the
 * pin is as long as those groups need (see `batchUnits`).
 */
export type FinaleProfile = {
  /** Pin length (viewport heights) with up to `BASE_MEMORIES` photos; with `batch`, the shortest pin. */
  baseVh: number;
  /** Extra pin length per photo beyond `BASE_MEMORIES`. */
  extraVhPerMemory: number;
  /** Ceiling on the pin length (without `batch`). */
  maxVh: number;
  /** Most memory photos shown around the note; `Infinity` shows them all. */
  maxMemories: number;
  /** How phone-width photos are placed: on a ring around the note, or in a pile above and below it (see pile-layout). */
  layout: "ring" | "pile";
  /** How far (share of the viewport height) a photo rises as it fades in; `null` rises from below the viewport. */
  rise: number | null;
  /** Photos arrive in groups of this many, the previous group dimming as the next one comes in; `null` staggers them one by one. */
  batch: number | null;
};

export const WIDE_FINALE: FinaleProfile = { baseVh: 2.8, extraVhPerMemory: 0.35, maxVh: 8, maxMemories: Infinity, layout: "ring", rise: null, batch: null };

export const COMPACT_FINALE: FinaleProfile = { baseVh: 1.8, extraVhPerMemory: 0, maxVh: 1.8, maxMemories: Infinity, layout: "pile", rise: 0.06, batch: 4 };

export const finaleProfile = (compact: boolean): FinaleProfile => (compact ? COMPACT_FINALE : WIDE_FINALE);
