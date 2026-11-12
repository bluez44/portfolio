import { OUTLINE_GAP } from "../../met/finale/constants";
import { noteFinaleScroll, noteScaleFor } from "../../met/finale/note-finale";
import { SELECTORS } from "../../met/elements";
import type { SectionMetrics } from "../types";
import { ENVELOPE_MAX_W, ENVELOPE_VW_SHARE } from "./constants";

const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

export function measureSections(): SectionMetrics | null {
  const get = (id: string) => document.getElementById(id);
  const stage = get("stage");
  const met = get("met");
  const ends = get("ends");
  const rsvp = get("rsvp");
  if (!stage || !met || !ends || !rsvp) return null;
  const vh = window.innerHeight;
  // The note wrapper never pins (its child does), so its document top is stable mid-pin too.
  const noteEnd = document.querySelector<HTMLElement>(SELECTORS.end);
  const note = document.querySelector<HTMLElement>(SELECTORS.note);
  const noteScale = note && noteScaleFor({ noteW: note.offsetWidth, noteH: note.offsetHeight, vw: window.innerWidth, vh });
  const noteFinale =
    noteEnd && note && noteScale
      ? { ...noteFinaleScroll(top(noteEnd), vh), width: (note.offsetWidth + OUTLINE_GAP * 2) * noteScale }
      : null;
  return {
    vh,
    stageTop: top(stage),
    stageScroll: stage.offsetHeight - vh,
    metTop: top(met),
    metHeight: met.offsetHeight,
    endsTop: top(ends),
    endsHeight: ends.offsetHeight,
    rsvpTop: top(rsvp),
    wishesTop: (() => {
      const wishes = get("bee-wall");
      return wishes ? top(wishes) : top(rsvp) + rsvp.offsetHeight;
    })(),
    wishesHeight: get("bee-wall")?.offsetHeight,
    finaleTop: (() => {
      const finale = get("finale");
      return finale ? top(finale) : undefined;
    })(),
    noteFinale,
  };
}

export function measureEnvelopeWidth(): number {
  return document.getElementById("envWrap")?.offsetWidth ?? Math.min(ENVELOPE_MAX_W, window.innerWidth * ENVELOPE_VW_SHARE);
}
