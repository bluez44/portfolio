/**
 * How long the personal-note finale stays pinned, and how many memory photos gather around it.
 * Phones get a shorter pin that no longer grows with the memory count, and only a sample of the
 * photos, so a long timeline does not turn the finale into many screens of scrolling.
 */
export type FinaleProfile = {
  /** Pin length (viewport heights) with up to `BASE_MEMORIES` photos. */
  baseVh: number;
  /** Extra pin length per photo beyond `BASE_MEMORIES`. */
  extraVhPerMemory: number;
  /** Ceiling on the pin length. */
  maxVh: number;
  /** Most memory photos shown around the note; `Infinity` shows them all. */
  maxMemories: number;
};

export const WIDE_FINALE: FinaleProfile = { baseVh: 2.8, extraVhPerMemory: 0.35, maxVh: 8, maxMemories: Infinity };

export const COMPACT_FINALE: FinaleProfile = { baseVh: 1.8, extraVhPerMemory: 0, maxVh: 1.8, maxMemories: 8 };

export const finaleProfile = (compact: boolean): FinaleProfile => (compact ? COMPACT_FINALE : WIDE_FINALE);
