import { z } from "zod";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "./slug";

const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

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
});

export type GuestInput = z.output<typeof guestInputSchema>;
