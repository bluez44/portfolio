import type { EmailMessage, SendEmailResult } from "@/lib/email/send-email";
import { buildRsvpEmail } from "./rsvp-email";
import { rsvpInputSchema } from "./rsvp-schema";
import type { GuestRecord, RsvpStatus } from "./types";

export type RsvpDeps = {
  findGuest(slug: string): Promise<GuestRecord | null>;
  saveRsvp(guestId: string, status: RsvpStatus): Promise<{ previous: RsvpStatus | null }>;
  notify(message: EmailMessage): Promise<SendEmailResult>;
  now(): Date;
};

export type SubmitRsvpResult =
  | { ok: true; status: RsvpStatus }
  | { ok: false; error: "invalid" | "not_found" };

export async function submitRsvp(raw: unknown, deps: RsvpDeps): Promise<SubmitRsvpResult> {
  const parsed = rsvpInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { slug, status } = parsed.data;

  const guest = await deps.findGuest(slug);
  if (!guest) return { ok: false, error: "not_found" };

  const { previous } = await deps.saveRsvp(guest.id, status);

  if (previous !== status) {
    const message = buildRsvpEmail({ name: guest.name, slug, status, previous, at: deps.now() });
    try {
      const sent = await deps.notify(message);
      if (!sent.ok) console.error(`RSVP email not sent (${sent.reason}) for ${slug}`);
    } catch (error) {
      console.error("RSVP email failed:", error);
    }
  }

  return { ok: true, status };
}
