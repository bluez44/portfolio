"use client";

import gsap from "gsap";
import { useCallback, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useCourierBee } from "../courier/courier-bee-provider";

export function useReplySendoff(cardRef: RefObject<HTMLElement | null>, hasInitialSaved: boolean) {
  const { carryOff } = useCourierBee();
  const reduced = useReducedMotion();
  const [showResult, setShowResult] = useState(hasInitialSaved);
  const [postmarked, setPostmarked] = useState(hasInitialSaved);
  const sendoffActive = useRef(false);

  const startSendoff = useCallback(async () => {
    if (sendoffActive.current) return;
    sendoffActive.current = true;

    const card = cardRef.current;
    if (reduced || !card) {
      setPostmarked(true);
      setShowResult(true);
      sendoffActive.current = false;
      return;
    }

    setPostmarked(true);

    // Fold the letter in 3D before the courier bee carries it off
    await new Promise<void>((resolve) => {
      gsap.to(card, {
        scale: 0.88,
        rotateX: 45,
        duration: 0.5,
        ease: "power2.inOut",
        transformOrigin: "50% 50%",
        onComplete: () => resolve(),
      });
    });

    await carryOff(card);

    setShowResult(true);
    gsap.fromTo(
      card,
      { opacity: 0, y: 14, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out", clearProps: "all" },
    );
    sendoffActive.current = false;
  }, [cardRef, carryOff, reduced]);

  return { showResult, postmarked, startSendoff };
}
