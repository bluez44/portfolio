"use client";

import { useEffect, useState } from "react";

interface Pair {
  prefix: string;
  highlight: string;
}

interface UseTypewriterPairsOptions {
  typingSpeedMs?: number;
  deletingSpeedMs?: number;
  pauseMs?: number;
  reducedMotion?: boolean;
}

// Types a { prefix, highlight } pair as one continuous string, then splits the
// currently-visible substring back into prefix/highlight for rendering. A
// single state machine drives both parts so they can never desync — unlike
// running two independent TypeAnimation instances side by side, which drift
// out of pairing whenever the two strings differ in length.
export function useTypewriterPairs(
  pairs: readonly Pair[],
  {
    typingSpeedMs = 55,
    deletingSpeedMs = 30,
    pauseMs = 1800,
    reducedMotion = false,
  }: UseTypewriterPairsOptions = {},
) {
  const [prefix, setPrefix] = useState(pairs[0]?.prefix ?? "");
  const [highlight, setHighlight] = useState(pairs[0]?.highlight ?? "");

  useEffect(() => {
    if (reducedMotion || pairs.length === 0) {
      // reducedMotion starts false and flips true only after a later effect
      // reads matchMedia, so this branch must be able to snap the visible
      // text back to the static first pair once that happens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrefix(pairs[0]?.prefix ?? "");
      setHighlight(pairs[0]?.highlight ?? "");
      return;
    }

    let pairIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId: number;

    const applyLength = (pair: Pair, length: number) => {
      const visible = (pair.prefix + pair.highlight).slice(0, length);
      setPrefix(visible.slice(0, pair.prefix.length));
      setHighlight(visible.slice(pair.prefix.length));
    };

    const tick = () => {
      const pair = pairs[pairIndex];
      const total = pair.prefix.length + pair.highlight.length;

      if (!deleting) {
        charIndex++;
        applyLength(pair, charIndex);
        timeoutId = window.setTimeout(
          tick,
          charIndex === total ? pauseMs : typingSpeedMs,
        );
        deleting = charIndex === total;
        return;
      }

      charIndex--;
      applyLength(pair, charIndex);
      if (charIndex === 0) {
        deleting = false;
        pairIndex = (pairIndex + 1) % pairs.length;
      }
      timeoutId = window.setTimeout(tick, deletingSpeedMs);
    };

    timeoutId = window.setTimeout(tick, typingSpeedMs);
    return () => window.clearTimeout(timeoutId);
  }, [pairs, reducedMotion, typingSpeedMs, deletingSpeedMs, pauseMs]);

  return { prefix, highlight };
}
