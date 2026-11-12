export type CueId = "chapter-dip" | "writing" | "finale-swell";

export type MusicCue = {
  readonly id: CueId;
  readonly volume: number;
  readonly priority: number;
};

export const BASE_VOLUME = 100;

export const MUSIC_CUES: Readonly<Record<CueId, MusicCue>> = {
  "finale-swell": { id: "finale-swell", volume: 100, priority: 3 },
  writing: { id: "writing", volume: 35, priority: 2 },
  "chapter-dip": { id: "chapter-dip", volume: 60, priority: 1 },
};

export function volumeFor(active: ReadonlySet<CueId>): number {
  if (active.size === 0) return BASE_VOLUME;

  let activeCue: MusicCue | null = null;
  for (const id of active) {
    const cue = MUSIC_CUES[id];
    if (!cue) continue;
    if (!activeCue || cue.priority > activeCue.priority) {
      activeCue = cue;
    }
  }

  return activeCue ? activeCue.volume : BASE_VOLUME;
}
