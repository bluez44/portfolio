import { loadGraduationContent } from "@/lib/graduation/content/load-content";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
import { icsResponse } from "@/lib/graduation/ics-response";

export async function GET(request: Request) {
  const guestKey = new URL(request.url).searchParams.get("g");
  const found = guestKey ? await getInvitationGuest(guestKey).catch(() => null) : null;
  const { event, owner } = await loadGraduationContent(await getGraduationLang(), found?.guest ?? null);
  return icsResponse(event, owner.name);
}
