import { z } from "zod";
import { isPhoneOrEmail } from "./rsvp-contact";
import { UUID_REGEX } from "./uuid";
import type { RsvpAnswer } from "./types";

export const RSVP_CONTACT_MAX = 120;
export const RSVP_TEXT_MAX = 500;

export type RsvpField = "contact" | "reason" | "wish";
export type RsvpFieldError = "required" | "invalid_contact" | "too_long";
export type RsvpFieldErrors = Partial<Record<RsvpField, RsvpFieldError>>;

const guestId = z.string().regex(UUID_REGEX);
const required = (max: number) =>
  z.string({ error: "required" }).trim().min(1, "required").max(max, "too_long");
const optional = z
  .string()
  .trim()
  .max(RSVP_TEXT_MAX, "too_long")
  .optional()
  .transform((v) => v || null);

export const rsvpInputSchema = z.discriminatedUnion("status", [
  z.object({
    guestId,
    status: z.literal("yes"),
    contact: required(RSVP_CONTACT_MAX).refine(isPhoneOrEmail, "invalid_contact"),
    wish: optional,
  }),
  z.object({ guestId, status: z.literal("no"), reason: required(RSVP_TEXT_MAX), wish: optional }),
]);

export type RsvpInput = z.output<typeof rsvpInputSchema>;

export type ParsedRsvp =
  | { ok: true; guestId: string; answer: RsvpAnswer }
  | { ok: false; fieldErrors: RsvpFieldErrors };

const FIELDS: readonly string[] = ["contact", "reason", "wish"] satisfies RsvpField[];

/** Validates RSVP form input; field problems come back keyed by field (empty when guestId/status are bad). */
export function parseRsvpInput(raw: unknown): ParsedRsvp {
  const parsed = rsvpInputSchema.safeParse(raw);
  if (parsed.success) {
    const { guestId, ...answer } = parsed.data;
    return { ok: true, guestId, answer };
  }
  const fieldErrors: RsvpFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && FIELDS.includes(field)) {
      fieldErrors[field as RsvpField] ??= issue.message as RsvpFieldError;
    }
  }
  return { ok: false, fieldErrors };
}
