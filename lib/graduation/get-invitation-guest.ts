import { cache } from "react";
import { guestRepository } from "./guest-repository";

/** One DB hit per request, shared by generateMetadata and the page. */
export const getInvitationGuest = cache((slug: string) => guestRepository.findInvitation(slug));
