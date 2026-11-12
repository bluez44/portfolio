"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useScrollLock } from "@/lib/hooks/use-scroll-lock";
import { gateReducer } from "./gate-phase";

export function useLetterGate(ready: boolean, { animate, openMs }: { animate: boolean; openMs: number }) {
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

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => dispatch({ type: "openFinished" }), openMs);
    return () => window.clearTimeout(timer);
  }, [phase, openMs]);

  useScrollLock(phase !== "done");

  const open = useCallback(() => dispatch({ type: "open", animate }), [animate]);
  return { phase, open };
}
