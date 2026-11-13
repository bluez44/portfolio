"use server";

import { sendEmail } from "@/lib/email/send-email";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { rsvpRepository } from "@/lib/graduation/rsvp-repository";
import { submitRsvp, type SubmitRsvpResult } from "@/lib/graduation/rsvp-service";
/** `input` is untrusted form data; `submitRsvp` validates it. */
export async function submitRsvpAction(input: Record<string, unknown>): Promise<SubmitRsvpResult> {
  return submitRsvp(
    input,
    {
      findGuest: guestRepository.findById,
      saveRsvp: rsvpRepository.save,
      notify: (message) => sendEmail(message),
      now: () => new Date(),
    },
  );
}
