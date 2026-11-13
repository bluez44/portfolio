import { COPY_FIELDS } from ".";

export const GUEST_COPY_TABS = {
  envelope: ["stage.cover.lead", "stage.cover.accent", "card.greeting", "card.body", "card.author"],
  met: ["met.heading.lead", "met.heading.accent", "met.intro", "met.defaultNote"],
  ends: [
    "ends.heading.lead",
    "ends.heading.accent",
    "ends.intro",
    "ends.venue",
    "ends.address",
    "rails.whereValue",
    "rails.whereSub",
    "ends.notes",
    "ends.specialMessage",
  ],
  rsvp: ["rsvp.heading.lead", "rsvp.heading.accent", "rsvp.prompt"],
} as const satisfies Record<string, readonly string[]>;

export const GUEST_COPY_KEYS: readonly string[] = Object.values(GUEST_COPY_TABS).flat();

const guestKeySet = new Set(GUEST_COPY_KEYS);
export const GUEST_COPY_FIELDS = COPY_FIELDS.filter((field) => guestKeySet.has(field.key));
