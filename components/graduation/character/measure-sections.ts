import type { SectionMetrics } from "./types";

const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

export function measureSections(): SectionMetrics | null {
  const get = (id: string) => document.getElementById(id);
  const stage = get("stage");
  const met = get("met");
  const ends = get("ends");
  const rsvp = get("rsvp");
  if (!stage || !met || !ends || !rsvp) return null;
  const vh = window.innerHeight;
  return {
    vh,
    stageTop: top(stage),
    stageScroll: stage.offsetHeight - vh,
    metTop: top(met),
    metHeight: met.offsetHeight,
    endsTop: top(ends),
    endsHeight: ends.offsetHeight,
    rsvpTop: top(rsvp),
  };
}

export function measureEnvelopeWidth(): number {
  return document.getElementById("envWrap")?.offsetWidth ?? Math.min(560, window.innerWidth * 0.5);
}
