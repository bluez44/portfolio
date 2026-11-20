/** Carousel of moment cards in the phone moment viewer. */

/** Resting card width (vw); the side padding centres the first and last card. */
export const CARD_VW = 72;
/** Space (vw) between cards, wide enough that a focused card's lift never overlaps its neighbours. */
export const GAP_VW = 12;
/** Extra scale the focused card gains on phones (desktop keeps its own, smaller lift). */
export const CARD_LIFT = 0.1;
/** Extra scale the focused card's text gains: 1 + 0.25 = 1.25×. */
export const TEXT_LIFT = 0.25;
/** A card is fully focused at the scroller's centre and idle once its centre is one card width away. */
export const FOCUS_REACH_CARDS = 1;
