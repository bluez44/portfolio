import { guestInputSchema } from "./guest-schema";
import type { GuestWriter } from "./guest-repository";
import type { GuestData } from "./types";
import { toSlug } from "./slug";
import { SlugTakenError } from "./slug-taken-error";

export type GuestField = "name" | "slug" | "note" | "customContent";
export type SaveGuestResult =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<GuestField, string>> };

const fail = (fieldErrors: Partial<Record<GuestField, string>>): SaveGuestResult => ({
  ok: false,
  fieldErrors,
});

export async function saveGuest(
  repo: GuestWriter,
  raw: Record<string, unknown>,
  id?: string,
): Promise<SaveGuestResult> {
  const parsed = guestInputSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Partial<Record<GuestField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as GuestField;
      const detail = issue.path.slice(1).map(String).join(".");
      errors[field] ??= field === "customContent" && detail ? `${detail}: ${issue.message}` : issue.message;
    }
    return fail(errors);
  }

  const { name, note, customContent } = parsed.data;
  const slug = parsed.data.slug ?? toSlug(name);
  if (!slug) return fail({ slug: "Không tạo được slug từ tên, hãy nhập tay" });

  const guestData: GuestData = { name, slug, note };
  if (customContent !== undefined) {
    guestData.customContent = customContent;
  }

  try {
    if (id) await repo.update(id, guestData);
    else await repo.create(guestData);
    return { ok: true };
  } catch (error) {
    if (error instanceof SlugTakenError) return fail({ slug: "Slug đã tồn tại" });
    throw error;
  }
}
