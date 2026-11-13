import { z } from "zod";
import { copyOverridesSchema } from "./copy-entry-rules";
import { GUEST_COPY_FIELDS } from "./fields/guest-keys";
import { isRecord } from "./is-record";
import { convertLegacyGuestContent, isLegacyGuestContent } from "./legacy-guest-content";
import { eventTimesShape, guestImagesSchema, momentsSchema, musicSchema } from "./settings-rules";
import { endAfterStart } from "./validate-settings";

const guestCopySchema = copyOverridesSchema(GUEST_COPY_FIELDS);

export const guestContentSchema = z
  .object({
    vi: guestCopySchema.optional(),
    en: guestCopySchema.optional(),
    images: guestImagesSchema.optional(),
    moments: momentsSchema.optional(),
    event: z.object(eventTimesShape).optional(),
    music: musicSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const { start, end } = data.event ?? {};
    if (start && end && !endAfterStart(start, end)) {
      ctx.addIssue({ code: "custom", path: ["event", "end"], message: "Giờ kết thúc phải sau giờ bắt đầu" });
    }
  });

export const guestContentInputSchema = z.preprocess(
  (raw) => (isRecord(raw) && isLegacyGuestContent(raw) ? convertLegacyGuestContent(raw) : raw),
  guestContentSchema,
);
