import type { YTNamespace } from "./types";

const SRC = "https://www.youtube.com/iframe_api";
let pending: Promise<YTNamespace> | null = null;

/** Loads the YouTube IFrame API once. Retries after a failure. */
export function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;

  pending = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onerror = () => {
      pending = null;
      script.remove();
      reject(new Error("YouTube IFrame API failed to load"));
    };
    document.head.appendChild(script);
  });
  return pending;
}
