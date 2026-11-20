export type TrackState = "loading" | "ready" | "playing" | "paused" | "error";

export interface AudioTrack {
  play(): Promise<void>;
  pause(): void;
  fadeTo(level: number, ms: number, onDone?: () => void): void;
  setLevel(level: number): void;
  readonly playing: boolean;
  subscribe(listener: (s: TrackState) => void): () => void;
  dispose(): void;
}

const EVENT_MAP: ReadonlyArray<readonly [string, TrackState]> = [
  ["canplaythrough", "ready"],
  ["playing", "playing"],
  ["pause", "paused"],
  ["error", "error"],
];

const clampLevel = (level: number) => Math.max(0, Math.min(1, level));

export function createGainTrack(
  src: string,
  deps?: {
    createElement?: () => HTMLAudioElement;
    createContext?: () => AudioContext;
  },
): AudioTrack {
  const createElement = deps?.createElement ?? (() => new Audio());
  const createContext = deps?.createContext ?? (() => new AudioContext());

  const element = createElement();
  element.loop = true;
  element.preload = "auto";
  element.setAttribute("playsinline", "");
  element.src = src;

  let context: AudioContext | null = null;
  let gain: GainNode | null = null;
  let state: TrackState = "loading";
  let targetLevel = 1;
  let fadeTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const listeners = new Set<(s: TrackState) => void>();

  const clearFadeTimer = () => {
    if (fadeTimer !== null) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }
  };

  const notify = (next: TrackState) => {
    if (next === "ready" && state !== "loading") return;
    if (state === next) return;
    state = next;
    for (const listener of listeners) {
      listener(state);
    }
  };

  const handlers = EVENT_MAP.map(([event, next]) => {
    const handler = () => notify(next);
    element.addEventListener(event, handler);
    return [event, handler] as const;
  });

  // Route through a Web Audio GainNode because iOS Safari ignores HTMLMediaElement.volume.
  const ensureGraph = () => {
    if (context && gain) return { context, gain };
    context = createContext();
    const source = context.createMediaElementSource(element);
    gain = context.createGain();
    gain.gain.value = targetLevel;
    source.connect(gain);
    gain.connect(context.destination);
    return { context, gain };
  };

  return {
    get playing() {
      return state === "playing";
    },

    play() {
      if (disposed) return Promise.reject(new Error("AudioTrack disposed"));
      const { context: ctx } = ensureGraph();
      Promise.resolve(ctx.resume()).catch(() => {});
      return Promise.resolve(element.play());
    },

    pause() {
      clearFadeTimer();
      element.pause();
    },

    fadeTo(level, ms, onDone) {
      if (disposed) return;
      const target = clampLevel(level);
      clearFadeTimer();
      targetLevel = target;
      if (context && gain) {
        const now = context.currentTime;
        const current = gain.gain.value;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(current, now);
        gain.gain.linearRampToValueAtTime(target, now + ms / 1000);
      }
      if (onDone) {
        fadeTimer = setTimeout(() => {
          fadeTimer = null;
          onDone();
        }, ms);
      }
    },

    setLevel(level) {
      if (disposed) return;
      const target = clampLevel(level);
      clearFadeTimer();
      targetLevel = target;
      if (context && gain) {
        const now = context.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.value = target;
        gain.gain.setValueAtTime(target, now);
      }
    },

    subscribe(listener) {
      if (disposed) return () => {};
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      clearFadeTimer();
      for (const [event, handler] of handlers) {
        element.removeEventListener(event, handler);
      }
      listeners.clear();
      state = "paused";
      element.pause();
      element.removeAttribute("src");
      element.load();
      if (context) {
        Promise.resolve(context.close()).catch(() => {});
        context = null;
        gain = null;
      }
    },
  };
}
