"use client";

import gsap from "gsap";
import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useCourierBee } from "../courier/courier-bee-provider";

/** How long the freshly stamped letter stays flat before it folds. */
const STAMP_HOLD_S = 0.75;

export function useReplySendoff(cardRef: RefObject<HTMLElement | null>, hasInitialSaved: boolean) {
  const { carryOff } = useCourierBee();
  const reduced = useReducedMotion();
  const [showResult, setShowResult] = useState(hasInitialSaved);
  const [postmarked, setPostmarked] = useState(hasInitialSaved);
  const sendoffActive = useRef(false);
  const revealPending = useRef(false);

  const startSendoff = useCallback(async () => {
    if (sendoffActive.current) return;
    sendoffActive.current = true;
    // A re-sent reply (after "change answer") must hide the previous result until the bee has carried the letter off.
    setShowResult(false);

    const card = cardRef.current;
    if (reduced || !card) {
      setPostmarked(true);
      setShowResult(true);
      sendoffActive.current = false;
      return;
    }

    setPostmarked(true);

    // Let the postmark land and be read (its stamp animation runs 0.35s), then fold the letter
    // in 3D for the courier bee, which flies in and perches on it before carrying it off.
    await new Promise<void>((resolve) => {
      gsap.to(card, {
        scale: 0.88,
        rotateX: 45,
        delay: STAMP_HOLD_S,
        duration: 0.45,
        ease: "power2.inOut",
        transformOrigin: "50% 50%",
        onComplete: () => resolve(),
      });
    });

    await carryOff(card);

    // The fade-in runs in the layout effect below, once React has committed the result into the card.
    revealPending.current = true;
    setShowResult(true);
  }, [cardRef, carryOff, reduced]);

  useLayoutEffect(() => {
    if (!showResult || !revealPending.current) return;
    revealPending.current = false;
    const card = cardRef.current;
    if (!card) {
      sendoffActive.current = false;
      return;
    }
    // carryOff leaves x / rotation / rotateX on the card; drop every leftover transform so the
    // fade-in starts from the card's real resting place instead of snapping there at the end.
    gsap.set(card, { clearProps: "transform" });
    const tween = gsap.fromTo(
      card,
      { opacity: 0, x: 0, y: 14, scale: 0.98, rotation: 0, rotateX: 0 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        ease: "power2.out",
        clearProps: "all",
        onComplete: () => {
          sendoffActive.current = false;
        },
      },
    );
    return () => {
      // Only clean up an interrupted fade-in (e.g. unmount); a finished one has already cleared itself,
      // and this cleanup also runs when a re-send flips showResult back to false mid-sendoff.
      if (tween.progress() < 1) {
        tween.kill();
        gsap.set(card, { clearProps: "all" });
        sendoffActive.current = false;
      }
    };
  }, [showResult, cardRef]);

  return { showResult, postmarked, startSendoff };
}
