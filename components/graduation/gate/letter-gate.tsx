"use client";

import { useEffect } from "react";
import { BeeIntro } from "./bee-intro";
import { useLetterGate } from "./use-letter-gate";

type Props = { ready: boolean; guestName: string; musicPlaying: boolean; onOpen: () => void; onOpened: () => void };

/** Holds the page behind the intro until the guest opens it; `onOpen` is the music's user activation. */
export function LetterGate({ ready, guestName, musicPlaying, onOpen, onOpened }: Props) {
  const { phase, open, finish } = useLetterGate(ready);

  useEffect(() => {
    if (phase === "done") onOpened();
  }, [phase, onOpened]);

  if (phase === "done") return null;

  const onEnter = (withMusic: boolean) => {
    if (phase !== "ready") return false;
    if (withMusic) onOpen();
    open();
    return true;
  };

  return <BeeIntro guestName={guestName} phase={phase} musicPlaying={musicPlaying} onEnter={onEnter} onExited={finish} />;
}
