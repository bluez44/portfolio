import { z } from "zod";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "./slug";
import { guestCustomContentSchema } from "./guest-custom-schema";
import { blankToUndefined } from "./content/settings-rules";

const parseCustomContent = (v: unknown) => {
  if (v === undefined) return undefined;
  if (!v || v === "" || v === "null") return null;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return guestCustomContentSchema.parse(parsed);
    } catch {
      return null;
    }
  }
  if (typeof v === "object") {
    return guestCustomContentSchema.parse(v);
  }
  return null;
};

export const guestInputSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên khách").max(80, "Tối đa 80 ký tự"),
  slug: z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .max(SLUG_MAX_LENGTH, `Tối đa ${SLUG_MAX_LENGTH} ký tự`)
      .regex(SLUG_PATTERN, "Chỉ dùng a-z, 0-9 và dấu gạch")
      .optional(),
  ),
  note: z
    .string()
    .trim()
    .max(500, "Tối đa 500 ký tự")
    .transform((v) => (v === "" ? null : v)),
  customContent: z.preprocess(parseCustomContent, guestCustomContentSchema.nullable().optional()),
});

export type GuestInput = z.output<typeof guestInputSchema>;
