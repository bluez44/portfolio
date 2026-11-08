"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth/session";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { saveGuest, type SaveGuestResult } from "@/lib/graduation/guest-service";

const SESSION_EXPIRED_ERROR = "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại";

export type GuestFormState =
  | SaveGuestResult
  | { ok: false; fieldErrors: Record<string, never>; error: string }
  | null;

const field = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function saveGuestAction(
  _prev: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  if (!(await isAdminSession())) {
    return { ok: false, fieldErrors: {}, error: SESSION_EXPIRED_ERROR };
  }
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
  if (!(await isAdminSession())) redirect("/admin");
  const id = field(formData, "id");
  if (!id) return;
  await guestRepository.remove(id);
  revalidatePath("/admin");
}
