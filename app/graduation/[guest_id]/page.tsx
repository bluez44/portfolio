import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationInvitation } from "@/components/graduation/invitation";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { readOwnerPhone } from "@/lib/graduation/owner-phone";
import { GRADUATION_COPY } from "@/lib/graduation/i18n";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ guest_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guest_id } = await params;
  const found = guest_id ? await getInvitationGuest(guest_id) : null;
  const { meta } = GRADUATION_COPY[await getGraduationLang()];
  const title = found ? meta.guestTitle(found.guest.name) : meta.title;
  const description = meta.description;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, url: `/graduation/${guest_id}` },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/graduation/${guest_id}` },
  };
}

export default async function GraduationGuestPage({ params }: Props) {
  const { guest_id } = await params;
  if (!guest_id) notFound();
  const found = await getInvitationGuest(guest_id);
  if (!found) notFound();
  const lang = await getGraduationLang();
  return (
    <GraduationInvitation
      guest={found.guest}
      initialRsvp={found.rsvp}
      initialLang={lang}
      ownerPhone={readOwnerPhone()}
    />
  );
}
