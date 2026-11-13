"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth/session";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { saveGuest, type SaveGuestResult } from "@/lib/graduation/guest-service";
import { SESSION_EXPIRED_ERROR } from "./session-expired";

export type GuestActionState =
  | SaveGuestResult
  | { ok: false; fieldErrors: Record<string, string>; error: string }
  | null;

const field = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function saveGraduationGuestAction(
  _prev: GuestActionState,
  formData: FormData,
): Promise<GuestActionState> {
  if (!(await isAdminSession())) {
    return { ok: false, fieldErrors: {}, error: SESSION_EXPIRED_ERROR };
  }

  const id = field(formData, "id") || undefined;
  const name = field(formData, "name");
  const slug = field(formData, "slug");
  const note = field(formData, "note");
  const customContentRaw = field(formData, "customContent");

  let customContent: unknown = undefined;
  if (customContentRaw && customContentRaw.trim() !== "") {
    try {
      customContent = JSON.parse(customContentRaw);
    } catch {
      return { ok: false, fieldErrors: { customContent: "Dữ liệu custom không hợp lệ" }, error: "Lỗi định dạng JSON" };
    }
  }

  const result = await saveGuest(
    guestRepository,
    {
      name,
      slug,
      note,
      customContent,
    },
    id,
  );

  if (result.ok) {
    revalidatePath("/admin/graduation");
    revalidatePath("/admin");
    revalidatePath("/graduation/[guest_id]", "page");
  }

  return result as GuestActionState;
}

export async function deleteGraduationGuestAction(formData: FormData): Promise<void> {
  if (!(await isAdminSession())) redirect("/admin");
  const id = field(formData, "id");
  if (!id) return;
  await guestRepository.remove(id);
  revalidatePath("/admin/graduation");
  revalidatePath("/admin");
}
