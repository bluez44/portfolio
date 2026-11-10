import type { Lang } from "./types";

export const LANGS: readonly Lang[] = ["vi", "en"];
export const DEFAULT_LANG: Lang = "vi";
export const LANG_COOKIE = "graduation-lang";
/** The cookie only matters to the invitation route. */
export const LANG_COOKIE_PATH = "/graduation";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseLang(value: string | undefined): Lang {
  return value === "en" || value === "vi" ? value : DEFAULT_LANG;
}
