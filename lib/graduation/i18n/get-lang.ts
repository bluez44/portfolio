import { cookies } from "next/headers";
import { LANG_COOKIE, parseLang } from "./config";
import type { Lang } from "./types";

/** Server-only: the visitor's chosen invitation language (cookie), defaulting to Vietnamese. */
export async function getGraduationLang(): Promise<Lang> {
  return parseLang((await cookies()).get(LANG_COOKIE)?.value);
}
