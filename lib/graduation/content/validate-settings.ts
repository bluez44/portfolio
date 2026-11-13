import { z } from "zod";
import { GRADUATION_EVENT } from "../event";
import { copyOverridesSchema } from "./copy-entry-rules";
import { COPY_FIELDS } from "./fields";
import { issuesToFieldErrors } from "./issue-paths";
import { eventSchema, imagesSchema, momentsSchema, ownerSchema } from "./settings-rules";
import type { GraduationSettingsContent } from "./settings-types";

export type SettingsValidation = { ok: true; data: GraduationSettingsContent } | { ok: false; fieldErrors: Record<string, string> };

export const endAfterStart = (start: string | undefined, end: string | undefined) =>
  Date.parse(end ?? GRADUATION_EVENT.endUtc) > Date.parse(start ?? GRADUATION_EVENT.startUtc);

const copySchema = copyOverridesSchema(COPY_FIELDS);

const settingsSchema = z
  .object({
    owner: ownerSchema.optional(),
    event: eventSchema.optional(),
    images: imagesSchema.optional(),
    moments: momentsSchema.optional(),
    copy: z.object({ vi: copySchema.optional(), en: copySchema.optional() }).optional(),
  })
  .superRefine((data, ctx) => {
    if (!endAfterStart(data.event?.start, data.event?.end)) {
      ctx.addIssue({ code: "custom", path: ["event", "end"], message: "Giờ kết thúc phải sau giờ bắt đầu" });
    }
  });

export function validateSettings(raw: unknown): SettingsValidation {
  const parsed = settingsSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data as GraduationSettingsContent };
  return { ok: false, fieldErrors: issuesToFieldErrors(parsed.error.issues) };
}
