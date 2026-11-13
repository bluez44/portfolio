import { z } from "zod";

export const LIMITS = {
  copy: 2000,
  ownerName: 80,
  initials: 4,
  url: 500,
  phone: 30,
  moments: 12,
  year: 10,
  momentTitle: 120,
  momentBody: 600,
} as const;

export const blankToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

export const optionalField = <T extends z.ZodType>(schema: T) => z.preprocess(blankToUndefined, schema.optional());

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
const IMAGE_PATH = /^(\/|https:\/\/)\S+$/;

export const risoColorSchema = z.enum(["tomato", "blue", "jade", "canary"]);
export const httpsUrlSchema = text(LIMITS.url).regex(/^https:\/\/\S+$/, "Link phải bắt đầu bằng https://");
export const imageUrlSchema = text(LIMITS.url).regex(IMAGE_PATH, "Ảnh phải là đường dẫn bắt đầu bằng / hoặc https://");
export const isoDateTimeSchema = z.iso.datetime({ error: "Thời gian không hợp lệ" });
export const youtubeIdSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{11}$/, "ID YouTube gồm đúng 11 ký tự");
export const mapEmbedUrlSchema = httpsUrlSchema.refine(
  (value) => value.startsWith("https://www.google.com/maps/embed"),
  "Dùng link nhúng của Google Maps (Chia sẻ → Nhúng bản đồ)",
);

export const ownerSchema = z.object({
  name: optionalField(text(LIMITS.ownerName)),
  initials: optionalField(text(LIMITS.initials)),
  website: optionalField(text(LIMITS.url)),
  phone: optionalField(text(LIMITS.phone)),
});

export const eventTimesShape = {
  start: optionalField(isoDateTimeSchema),
  end: optionalField(isoDateTimeSchema),
};

export const eventSchema = z.object({
  ...eventTimesShape,
  mapEmbedUrl: optionalField(mapEmbedUrlSchema),
  mapLinkUrl: optionalField(httpsUrlSchema),
  virtualTourUrl: optionalField(httpsUrlSchema),
  virtualTourOwnerUrl: optionalField(httpsUrlSchema),
  musicYoutubeId: optionalField(youtubeIdSchema),
});

export const imagesSchema = z.object({
  coverImage: optionalField(imageUrlSchema),
  togetherPhoto: optionalField(imageUrlSchema),
  badgeLogo: optionalField(imageUrlSchema),
});

export const guestImagesSchema = imagesSchema.pick({ coverImage: true, togetherPhoto: true });

const momentTextSchema = z.object({
  title: optionalField(text(LIMITS.momentTitle)),
  body: optionalField(text(LIMITS.momentBody)),
});

export const momentSchema = z.object({
  year: text(LIMITS.year),
  image: z
    .string()
    .trim()
    .max(LIMITS.url)
    .refine((value) => value === "" || IMAGE_PATH.test(value), "Ảnh phải là đường dẫn bắt đầu bằng / hoặc https://"),
  color: risoColorSchema.optional(),
  vi: momentTextSchema.optional(),
  en: momentTextSchema.optional(),
});

export const momentsSchema = z.array(momentSchema).max(LIMITS.moments, `Tối đa ${LIMITS.moments} kỷ niệm`);

export const musicSchema = z.object({ youtubeId: optionalField(youtubeIdSchema) });
