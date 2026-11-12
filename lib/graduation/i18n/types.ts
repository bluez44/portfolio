import type { RisoColor } from "../event";
import type { RsvpFieldError } from "../rsvp-schema";
import type { NarrationKey } from "@/components/graduation/character/types";

export type Lang = "vi" | "en";

export type Moment = { n: string; year: string; title: string; body: string; color: RisoColor; rot: number; image: string };
export type Heading = { lead: string; accent: string };
export type Field = { label: string; placeholder: string };
/** One tab of the venue guide: its label and the iframe title. */
export type GuideTab = { tab: string; frameTitle: string };
/** Attribution for content owned by someone else. */
export type Credit = { label: string; owner: string };
export type VenueGuideCopy = { tabsLabel: string; map: GuideTab & { hint: string }; tour: GuideTab & { load: string; open: string; credit: Credit } };

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
  card: { label: string; greeting: string; body: string; keepScrolling: string; coverImage?: string; author?: string };
  stage: { coverKicker: string; cover: Heading; greetKicker: string; scrollHint: string };
  met: { heading: Heading; intro: string; moments: Moment[]; andYou: (name: string) => string; defaultNote: string };
  ends: {
    heading: Heading;
    intro: string;
    stamp: string[];
    when: string;
    day: string;
    where: string;
    venue: string;
    venueSub: string;
    notes: string[];
    specialMessage?: string;
    directions: string;
    addToCalendar: string;
    guide: VenueGuideCopy;
  };
  rsvp: {
    heading: Heading;
    prompt: (name: string) => string;
    yes: string;
    no: string;
    error: string;
    result: { yes: string; no: string };
    change: string;
    contact: Field;
    reason: Field;
    wish: Field;
    optional: string;
    submit: string;
    sending: string;
    ownerPhone: string;
    fieldErrors: Record<RsvpFieldError, string>;
    letter: {
      to: string;
      from: (name: string) => string;
      sent: string;
    };
  };
  wishes: {
    mine: string;
  };
  finale: {
    heading: Heading;
    countdown: {
      days: string;
      hours: string;
      minutes: string;
      seconds: string;
      during: string;
      after: string;
    };
    replyOf: (name: string) => string;
    status: {
      yes: string;
      no: string;
    };
    noReply: string;
    replyNow: string;
  };
  gate: {
    dialogLabel: string;
    wake: string;
    tapHint: string;
    silent: string;
    soundHint: string;
    nowPlaying: string;
    preparing: string;
    beeNotice: (name: string) => string;
  };
  narrator: Record<NarrationKey, (name: string) => string>;
  footer: string;
  notFound: { kicker: string; heading: Heading; body: string };
};
