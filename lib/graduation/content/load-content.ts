import type { Lang } from "../i18n/types";
import { readOwnerPhone } from "../owner-phone";
import type { InvitationGuest } from "../types";
import { loadGraduationSettings } from "./load-settings";
import { normalizeGuestContent } from "./normalize-guest-content";
import { resolveGraduationContent, type ResolvedContent } from "./resolve-content";

export async function loadGraduationContent(lang: Lang, guest: InvitationGuest | null): Promise<ResolvedContent> {
  const settings = await loadGraduationSettings();
  return resolveGraduationContent({
    lang,
    settings,
    guest: guest ? normalizeGuestContent(guest.customContent, guest.note) : null,
    envPhone: readOwnerPhone(),
  });
}
