import { cache } from "react";
import { parseGuestId } from "./guest-path";
import { guestRepository } from "./guest-repository";

/** One DB hit per request, shared by generateMetadata and the page. */
export const getInvitationGuest = cache(async (segment: string) => {
  const id = parseGuestId(segment);
  return id ? guestRepository.findInvitation(id) : null;
});
