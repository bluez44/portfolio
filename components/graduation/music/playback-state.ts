export const YT_PLAYING = 1;
const YT_BUFFERING = 3;

/** After a play request, anything but playing or buffering means the browser refused it. */
export const playbackRefused = (state: number) => state !== YT_PLAYING && state !== YT_BUFFERING;
