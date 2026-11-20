import type { TailSide } from "./bubble-placement";

/** Per edge: an ink triangle and, one step smaller on top, a paper one, so only an outline shows. */
const TAILS: Record<TailSide, { show: string; ink: string; paper: string }> = {
  bottom: {
    show: "group-data-[tail=bottom]:block",
    ink: "-bottom-2 left-[calc(50%+var(--tail,0px))] -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-ink",
    paper: "-bottom-[6.5px] left-[calc(50%+var(--tail,0px))] -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-paper",
  },
  right: {
    show: "group-data-[tail=right]:block",
    ink: "top-1/2 -right-2 -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent border-l-ink",
    paper: "top-1/2 -right-[6.5px] -translate-y-1/2 border-y-[5px] border-l-[7px] border-y-transparent border-l-paper",
  },
  left: {
    show: "group-data-[tail=left]:block",
    ink: "top-1/2 -left-2 -translate-y-1/2 border-y-[6px] border-r-[8px] border-y-transparent border-r-ink",
    paper: "top-1/2 -left-[6.5px] -translate-y-1/2 border-y-[5px] border-r-[7px] border-y-transparent border-r-paper",
  },
};

/**
 * The speech bubble's tail, pointing at the character's head from the edge named by the bubble
 * root's `data-tail` (a `group`). CSS picks the edge, so following the head needs no re-render.
 */
export function BubbleTails() {
  return (Object.entries(TAILS) as [TailSide, (typeof TAILS)[TailSide]][]).map(([side, { show, ink, paper }]) => (
    <div key={side} aria-hidden className={`hidden ${show}`}>
      <div className={`absolute h-0 w-0 ${ink}`} />
      <div className={`absolute h-0 w-0 ${paper}`} />
    </div>
  ));
}
