"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { SELECTORS } from "../elements";
import { setCardActivation } from "../trail/card-activation";
import { carouselFocus, stepIndex } from "./carousel-focus";
import { FOCUS_REACH_CARDS } from "./constants";

export type MomentCarousel = {
  /** Index of the card nearest the centre. */
  active: number;
  count: number;
  /** Scrolls `step` cards forward (positive) or back (negative). */
  go: (step: number) => void;
};

const centerOf = (rect: DOMRect) => rect.left + rect.width / 2;

/** Centre of the scroller's visible area, in viewport px. */
const scrollerCenter = (list: HTMLElement) => list.getBoundingClientRect().left + list.clientWidth / 2;

const cardsIn = (list: HTMLElement) => Array.from(list.querySelectorAll<HTMLElement>(SELECTORS.moment));

/**
 * Phone carousel of moment cards: while `enabled`, the card nearest the scroller's centre is
 * focused (its `--a` rises toward 1, which lifts the card and its text) as the list scrolls
 * sideways. `go` steps to a neighbouring card. The trail drives `--a` instead on wider screens.
 */
export function useMomentCarousel(listRef: RefObject<HTMLElement | null>, enabled: boolean): MomentCarousel {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list) return;
    const cards = cardsIn(list);
    setCount(cards.length);

    let frame = 0;
    const update = () => {
      frame = 0;
      const rects = cards.map((card) => card.getBoundingClientRect());
      const reach = (rects[0]?.width ?? 0) * FOCUS_REACH_CARDS;
      const focus = carouselFocus(rects.map(centerOf), scrollerCenter(list), reach);
      cards.forEach((card, i) => setCardActivation(card, focus.values[i]));
      setActive(focus.active);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    list.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [listRef, enabled]);

  const go = useCallback(
    (step: number) => {
      const list = listRef.current;
      if (!list) return;
      const cards = cardsIn(list);
      const target = cards[stepIndex(active, step, cards.length)];
      if (!target) return;
      const offset = centerOf(target.getBoundingClientRect()) - scrollerCenter(list);
      list.scrollTo({ left: list.scrollLeft + offset, behavior: reduced ? "auto" : "smooth" });
    },
    [listRef, active, reduced],
  );

  return { active, count, go };
}
