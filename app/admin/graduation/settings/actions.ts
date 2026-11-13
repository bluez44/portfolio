"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth/session";
import { saveSettings } from "@/lib/graduation/content/settings-service";
import { settingsRepository } from "@/lib/graduation/settings-repository";
import { SESSION_EXPIRED_ERROR } from "../session-expired";

export type SettingsActionState = { ok: true } | { ok: false; fieldErrors: Record<string, string>; error: string };

export async function saveGraduationSettingsAction(formData: FormData): Promise<SettingsActionState> {
  if (!(await isAdminSession())) return { ok: false, fieldErrors: {}, error: SESSION_EXPIRED_ERROR };

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("content") ?? "{}"));
  } catch {
    return { ok: false, fieldErrors: {}, error: "Dữ liệu cài đặt không hợp lệ" };
  }

  const result = await saveSettings(settingsRepository, raw);
  if (!result.ok) return { ok: false, fieldErrors: result.fieldErrors, error: "Một số trường chưa hợp lệ" };

  revalidatePath("/graduation", "layout");
  revalidatePath("/admin/graduation");
  revalidatePath("/admin/graduation/settings");
  return { ok: true };
}
