export type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
};

export type YTPlayerEvent = { target: YTPlayer; data: number };

export type YTPlayerOptions = {
  host?: string;
  videoId: string;
  width?: number | string;
  height?: number | string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: YTPlayerEvent) => void;
    onStateChange?: (e: YTPlayerEvent) => void;
    onError?: (e: YTPlayerEvent) => void;
  };
};

export type YTNamespace = {
  Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}
