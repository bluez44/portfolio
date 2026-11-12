"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useScrollLock } from "@/lib/hooks/use-scroll-lock";
import { gateReducer } from "./gate-phase";

/** Phase of the intro cover; the exit animation decides when it is done by calling `finish`. */
export function useLetterGate(ready: boolean) {
  const [phase, dispatch] = useReducer(gateReducer, "arriving");

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (ready) dispatch({ type: "resourcesReady" });
  }, [ready]);

  useScrollLock(phase !== "done");

  const open = useCallback(() => dispatch({ type: "open", animate: true }), []);
  const finish = useCallback(() => dispatch({ type: "openFinished" }), []);
  return { phase, open, finish };
}
