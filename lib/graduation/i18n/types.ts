import type { RisoColor } from "../event";

export type Lang = "vi" | "en";

export type Moment = { n: string; year: string; title: string; body: string; color: RisoColor; rot: number; image: string };
export type Heading = { lead: string; accent: string };

export type GraduationCopy = {
  meta: { title: string; guestTitle: (name: string) => string; description: string };
  header: { title: string; musicUnavailable: string; music: string; switchLang: string };
  rails: { when: string; whenValue: string; where: string; whereValue: string; whereSub: string };
  envelope: {
    airMail: string;
    invitationNo: string;
    to: string;
    cordially: string;
    from: string;
    returnTo: string;
    faculty: string;
  };
  card: { label: string; greeting: string; body: string; keepScrolling: string };
  stage: { coverKicker: string; cover: Heading; greetKicker: string; scrollHint: string };
  met: { kicker: string; heading: Heading; intro: string; moments: Moment[]; andYou: (name: string) => string; defaultNote: string };
  ends: {
    kicker: string;
    heading: Heading;
    intro: string;
    stamp: string[];
    when: string;
    day: string;
    where: string;
    venue: string;
    venueSub: string;
    notes: string[];
    directions: string;
    addToCalendar: string;
  };
  rsvp: {
    heading: Heading;
    prompt: (name: string) => string;
    yes: string;
    no: string;
    error: string;
    result: { yes: string; no: string };
    change: string;
  };
  music: { nowPlaying: string; close: string };
  footer: string;
  notFound: { kicker: string; heading: Heading; body: string };
};
