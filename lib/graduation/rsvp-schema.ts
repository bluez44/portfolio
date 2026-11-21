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
const optional = z
  .string()
  .trim()
  .max(RSVP_TEXT_MAX, "too_long")
  .optional()
  .transform((v) => v || null);
/** Contact and reason are no longer asked for on the form; an answer without one reads back as "". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "too_long")
    .optional()
    .transform((v) => v ?? "");

export const rsvpInputSchema = z.discriminatedUnion("status", [
  z.object({
    guestId,
    status: z.literal("yes"),
    contact: optionalText(RSVP_CONTACT_MAX).refine((v) => !v || isPhoneOrEmail(v), "invalid_contact"),
    wish: optional,
  }),
  z.object({ guestId, status: z.literal("no"), reason: optionalText(RSVP_TEXT_MAX), wish: optional }),
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
