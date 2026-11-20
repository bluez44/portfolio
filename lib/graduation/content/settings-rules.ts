import { z } from "zod";
import { trackPathnameSchema } from "../audio-track";
import { IMAGE_FOCI } from "../image-focus";

export const LIMITS = {
  copy: 2000,
  ownerName: 80,
  initials: 4,
  url: 500,
  phone: 30,
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
  musicTrack: optionalField(trackPathnameSchema),
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
  focus: z.object({ phone: z.enum(IMAGE_FOCI).optional(), wide: z.enum(IMAGE_FOCI).optional() }).optional(),
  vi: momentTextSchema.optional(),
  en: momentTextSchema.optional(),
});

export const momentsSchema = z.array(momentSchema);

export const musicSchema = z.object({ track: optionalField(trackPathnameSchema) });
