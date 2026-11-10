import { CARD_FOCUS_AT } from "./constants";
import { scrollKeys, type ScrollKey } from "./scroll-mapping";

export type FocusInput = {
  /** Document y (px) of each card's dock on the trail. */
  dockTops: number[];
  /** Path length (px) to each dock, and the whole path. */
  stops: number[];
  total: number;
  /** Viewport height and the trail trigger's scroll range (px). */
  vh: number;
  start: number;
  end: number;
};

/** Scroll → path keys that bring the badge to each card as that card reaches `CARD_FOCUS_AT` of the viewport. */
export function cardFocusKeys({ dockTops, stops, total, vh, start, end }: FocusInput): ScrollKey[] {
  const range = end - start;
  if (range <= 0 || total <= 0) return scrollKeys([]);
  return scrollKeys(
    dockTops.map((top, i) => ({ at: (top - vh * CARD_FOCUS_AT - start) / range, value: stops[i] / total })),
  );
}
