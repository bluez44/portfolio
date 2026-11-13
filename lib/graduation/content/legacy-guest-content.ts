import { isRecord } from "./is-record";
import { joinList } from "./list-format";
import { getPath } from "./paths";

const LEGACY_SECTIONS = ["envelope", "met", "ends", "rsvp"];

const LEGACY_TEXT_KEYS: Readonly<Record<string, readonly string[]>> = {
  "envelope.coverLead": ["stage.cover.lead"],
  "envelope.coverAccent": ["stage.cover.accent"],
  "envelope.cardGreeting": ["card.greeting"],
  "envelope.cardBody": ["card.body"],
  "envelope.cardAuthor": ["card.author"],
  "met.headingLead": ["met.heading.lead"],
  "met.headingAccent": ["met.heading.accent"],
  "met.intro": ["met.intro"],
  "met.note": ["met.defaultNote"],
  "ends.headingLead": ["ends.heading.lead"],
  "ends.headingAccent": ["ends.heading.accent"],
  "ends.intro": ["ends.intro"],
  "ends.venue": ["ends.venue", "rails.whereValue"],
  "ends.address": ["ends.address", "rails.whereSub"],
  "ends.specialMessage": ["ends.specialMessage"],
  "rsvp.headingLead": ["rsvp.heading.lead"],
  "rsvp.headingAccent": ["rsvp.heading.accent"],
  "rsvp.prompt": ["rsvp.prompt"],
};

export const isLegacyGuestContent = (raw: Record<string, unknown>) => LEGACY_SECTIONS.some((section) => section in raw);

function legacyTexts(raw: Record<string, unknown>): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const [legacyKey, keys] of Object.entries(LEGACY_TEXT_KEYS)) {
    const value = getPath(raw, legacyKey);
    if (typeof value === "string" && value.trim() !== "") keys.forEach((key) => (texts[key] = value));
  }
  const notes = getPath(raw, "ends.notes");
  if (Array.isArray(notes) && notes.length > 0) texts["ends.notes"] = joinList(notes.map(String));
  return texts;
}

function legacyMoment(value: unknown) {
  const moment = isRecord(value) ? value : {};
  return { year: moment.year ?? "", image: moment.image ?? "", color: moment.color, vi: { title: moment.title, body: moment.body } };
}

export function convertLegacyGuestContent(raw: Record<string, unknown>): Record<string, unknown> {
  const moments = getPath(raw, "met.moments");
  return {
    vi: legacyTexts(raw),
    images: { coverImage: getPath(raw, "envelope.coverImage"), togetherPhoto: getPath(raw, "met.togetherPhoto") },
    moments: Array.isArray(moments) && moments.length > 0 ? moments.map(legacyMoment) : undefined,
    music: raw.music,
  };
}
