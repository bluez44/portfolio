"use server";

import { sendEmail } from "@/lib/email/send-email";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { rsvpRepository } from "@/lib/graduation/rsvp-repository";
import { submitRsvp, type SubmitRsvpResult } from "@/lib/graduation/rsvp-service";
import type { RsvpStatus } from "@/lib/graduation/types";

export async function submitRsvpAction(slug: string, status: RsvpStatus): Promise<SubmitRsvpResult> {
  return submitRsvp(
    { slug, status },
    {
      findGuest: guestRepository.findBySlug,
      saveRsvp: rsvpRepository.save,
      notify: (message) => sendEmail(message),
      now: () => new Date(),
    },
  );
}
