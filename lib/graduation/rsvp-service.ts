import type { EmailMessage, SendEmailResult } from "@/lib/email/send-email";
import { buildRsvpEmail } from "./rsvp-email";
import { parseRsvpInput, type RsvpFieldErrors } from "./rsvp-schema";
import type { GuestRecord, RsvpAnswer, RsvpStatus } from "./types";

export type RsvpDeps = {
  findGuest(slug: string): Promise<GuestRecord | null>;
  saveRsvp(guestId: string, answer: RsvpAnswer): Promise<{ previous: RsvpStatus | null }>;
  notify(message: EmailMessage): Promise<SendEmailResult>;
  now(): Date;
};

export type SubmitRsvpResult =
  | { ok: true; answer: RsvpAnswer }
  | { ok: false; error: "invalid"; fieldErrors: RsvpFieldErrors }
  | { ok: false; error: "not_found" };

/** Validates and saves a guest's RSVP, then emails the owner. A failed email never fails the RSVP. */
export async function submitRsvp(raw: unknown, deps: RsvpDeps): Promise<SubmitRsvpResult> {
  const parsed = parseRsvpInput(raw);
  if (!parsed.ok) return { ok: false, error: "invalid", fieldErrors: parsed.fieldErrors };
  const { slug, answer } = parsed;

  const guest = await deps.findGuest(slug);
  if (!guest) return { ok: false, error: "not_found" };

  const { previous } = await deps.saveRsvp(guest.id, answer);

  const message = buildRsvpEmail({ name: guest.name, slug, answer, previous, at: deps.now() });
  try {
    const sent = await deps.notify(message);
    if (!sent.ok) console.error(`RSVP email not sent (${sent.reason}) for ${slug}`);
  } catch (error) {
    console.error("RSVP email failed:", error);
  }

  return { ok: true, answer };
}
