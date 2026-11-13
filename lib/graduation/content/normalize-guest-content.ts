import { guestContentInputSchema } from "./guest-content-schema";
import type { GuestContent } from "./settings-types";

function parseStored(raw: unknown): GuestContent {
  if (raw == null) return {};
  const parsed = guestContentInputSchema.safeParse(raw);
  if (parsed.success) return parsed.data as GuestContent;
  console.warn("[graduation-guest] ignored invalid custom content");
  return {};
}

export function normalizeGuestContent(raw: unknown, guestNote: string | null): GuestContent {
  const content = parseStored(raw);
  const note = guestNote?.trim();
  if (!note || content.vi?.["met.defaultNote"]) return content;
  return { ...content, vi: { ...content.vi, "met.defaultNote": note } };
}
