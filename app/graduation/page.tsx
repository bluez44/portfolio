import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationInvitation } from "@/components/graduation/invitation";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { parseGuestSlug } from "@/lib/graduation/slug";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ to?: string | string[] }> };

const BASE_TITLE = "Graduation Invitation – Võ Lê Quang Vinh";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const slug = parseGuestSlug((await searchParams).to);
  const found = slug ? await getInvitationGuest(slug) : null;
  return {
    title: found ? `Thư mời tốt nghiệp · ${found.guest.name}` : BASE_TITLE,
    description: "You're invited to celebrate my graduation.",
    robots: { index: false, follow: false },
  };
}

export default async function GraduationPage({ searchParams }: Props) {
  const slug = parseGuestSlug((await searchParams).to);
  if (!slug) notFound();
  const found = await getInvitationGuest(slug);
  if (!found) notFound();
  return <GraduationInvitation guest={found.guest} initialRsvp={found.rsvp} />;
}
