import type { z } from "zod";
import { LANGS } from "../i18n/config";
import { copyEntryError } from "./copy-entry-rules";
import { COPY_FIELD_BY_KEY } from "./fields";
import { isRecord } from "./is-record";
import type { CopyOverrides } from "./overrides";
import { eventSchema, imagesSchema, momentSchema, ownerSchema } from "./settings-rules";
import type { GraduationSettingsContent } from "./settings-types";

const warn = (what: string) => console.warn(`[graduation-settings] ignored invalid ${what}`);

function keepObject<S extends z.ZodRawShape>(schema: z.ZodObject<S>, value: unknown, label: string) {
  if (!isRecord(value)) return undefined;
  const kept: Record<string, unknown> = {};
  for (const [key, fieldSchema] of Object.entries(schema.shape)) {
    const parsed = (fieldSchema as z.ZodType).safeParse(value[key]);
    if (!parsed.success) warn(`${label}.${key}`);
    else if (parsed.data !== undefined) kept[key] = parsed.data;
  }
  return Object.keys(kept).length > 0 ? (kept as z.output<z.ZodObject<S>>) : undefined;
}

function keepCopy(value: unknown, lang: string): CopyOverrides | undefined {
  if (!isRecord(value)) return undefined;
  const kept: CopyOverrides = {};
  for (const [key, text] of Object.entries(value)) {
    const valid = typeof text === "string" && text.trim() !== "" && copyEntryError(COPY_FIELD_BY_KEY.get(key), text) === null;
    if (valid) kept[key] = text.trim();
    else warn(`copy.${lang}.${key}`);
  }
  return Object.keys(kept).length > 0 ? kept : undefined;
}

function keepMoments(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const kept = value.flatMap((moment, index) => {
    const parsed = momentSchema.safeParse(moment);
    if (!parsed.success) warn(`moments.${index}`);
    return parsed.success ? [parsed.data] : [];
  });
  return kept.length > 0 ? kept : undefined;
}

export function sanitizeSettings(raw: unknown): GraduationSettingsContent {
  if (!isRecord(raw)) return {};
  const copy = isRecord(raw.copy) ? raw.copy : {};
  return {
    owner: keepObject(ownerSchema, raw.owner, "owner"),
    event: keepObject(eventSchema, raw.event, "event"),
    images: keepObject(imagesSchema, raw.images, "images"),
    moments: keepMoments(raw.moments),
    copy: Object.fromEntries(LANGS.map((lang) => [lang, keepCopy(copy[lang], lang)])),
  };
}
