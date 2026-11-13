import { UUID_REGEX } from "./uuid";

const UUID_LENGTH = 36;

type GuestRef = { id: string; slug: string };

/** The id is what grants access; the slug only makes the link readable. */
export function guestSegment({ id, slug }: GuestRef): string {
  return slug ? `${slug}-${id}` : id;
}

export function guestPath(guest: GuestRef): string {
  return `/graduation/${guestSegment(guest)}`;
}

/** Reads the guest id from "<slug>-<uuid>" or a bare "<uuid>"; anything else has no id. */
export function parseGuestId(segment: string): string | null {
  if (UUID_REGEX.test(segment)) return segment.toLowerCase();
  const id = segment.slice(-UUID_LENGTH);
  const separator = segment.at(-UUID_LENGTH - 1);
  return separator === "-" && UUID_REGEX.test(id) ? id.toLowerCase() : null;
}
