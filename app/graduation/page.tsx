import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationInvitation } from "@/components/graduation/invitation";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { readOwnerPhone } from "@/lib/graduation/owner-phone";
import { GRADUATION_COPY } from "@/lib/graduation/i18n";
import { parseGuestSlug } from "@/lib/graduation/slug";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ to?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const slug = parseGuestSlug((await searchParams).to);
  const found = slug ? await getInvitationGuest(slug) : null;
  const { meta } = GRADUATION_COPY[await getGraduationLang()];
  const title = found ? meta.guestTitle(found.guest.name) : meta.title;
  const description = meta.description;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, url: "/graduation" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: "/graduation" },
  };
}

export default async function GraduationPage({ searchParams }: Props) {
  const slug = parseGuestSlug((await searchParams).to);
  if (!slug) notFound();
  const found = await getInvitationGuest(slug);
  if (!found) notFound();
  const lang = await getGraduationLang();
  return <GraduationInvitation guest={found.guest} initialRsvp={found.rsvp} initialLang={lang} ownerPhone={readOwnerPhone()} />;
}
