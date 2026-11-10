import { LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_COOKIE_PATH } from "./config";
import type { Lang } from "./types";

/** Client-side write; the server reads it back in `get-lang.ts` so the page renders without a flash. */
export function writeLangCookie(lang: Lang): void {
  document.cookie = `${LANG_COOKIE}=${lang}; path=${LANG_COOKIE_PATH}; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
}
