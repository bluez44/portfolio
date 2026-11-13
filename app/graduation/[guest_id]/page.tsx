import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationInvitation } from "@/components/graduation/invitation";
import { loadGraduationContent } from "@/lib/graduation/content/load-content";
import { loadGraduationSettings } from "@/lib/graduation/content/load-settings";
import { normalizeGuestContent } from "@/lib/graduation/content/normalize-guest-content";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { readOwnerPhone } from "@/lib/graduation/owner-phone";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ guest_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guest_id } = await params;
  const found = guest_id ? await getInvitationGuest(guest_id) : null;
  const lang = await getGraduationLang();
  const { copy, owner } = await loadGraduationContent(lang, found?.guest ?? null);
  const title = found ? copy.meta.guestTitle(found.guest.name) : copy.meta.title;
  const description = copy.meta.description;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    // og:image / twitter:image come from the colocated opengraph-image.tsx.
    openGraph: {
      title,
      description,
      url: `/graduation/${guest_id}`,
      type: "website",
      siteName: owner.name,
      locale: lang === "vi" ? "vi_VN" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/graduation/${guest_id}` },
  };
}

export default async function GraduationGuestPage({ params }: Props) {
  const { guest_id } = await params;
  if (!guest_id) notFound();
  const found = await getInvitationGuest(guest_id);
  if (!found) notFound();
  const [lang, settings] = await Promise.all([getGraduationLang(), loadGraduationSettings()]);
  return (
    <GraduationInvitation
      guest={found.guest}
      guestContent={normalizeGuestContent(found.guest.customContent, found.guest.note)}
      settings={settings}
      initialRsvp={found.rsvp}
      initialLang={lang}
      envPhone={readOwnerPhone()}
    />
  );
}
