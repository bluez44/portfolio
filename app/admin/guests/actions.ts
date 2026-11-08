"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth/session";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { saveGuest, type SaveGuestResult } from "@/lib/graduation/guest-service";

export type GuestFormState = SaveGuestResult | null;

const field = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function saveGuestAction(
  _prev: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  await requireAdmin();
  const id = field(formData, "id") || undefined;
  const result = await saveGuest(
    guestRepository,
    { name: field(formData, "name"), slug: field(formData, "slug"), note: field(formData, "note") },
    id,
  );
  if (result.ok) revalidatePath("/admin");
  return result;
}

export async function deleteGuestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = field(formData, "id");
  if (!id) return;
  await guestRepository.remove(id);
  revalidatePath("/admin");
}
